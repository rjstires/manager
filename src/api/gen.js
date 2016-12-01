import _ from 'lodash';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';

/**
 * Adds parent properties to all subresources and returns a new config.
 */
export function genConfig(config, parent = undefined) {
  const result = { ...config, parent };
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      result.subresources[key] =
        genConfig(config.subresources[key], result);
    });
  }
  return Object.freeze(result);
}

function fullyQualified(resource) {
  let path = resource.plural;
  let res = resource;
  while (res.parent) {
    res = res.parent;
    path = `${res.plural}.${path}`;
  }
  return path;
}

const actionGenerators = {
  [ONE]: c => (resource, ...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/ONE`, resource, ids: ids.map(n => parseInt(n)) }),
  [MANY]: c => (page, ...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/MANY`, page, ids: ids.map(n => parseInt(n)) }),
  [DELETE]: c => (...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/DELETE`, ids: ids.map(n => parseInt(n)) }),
};

/**
 * Generates action creators for the provided config.
 */
export function genActions(config) {
  const actions = { };
  const fns = {
    [ONE]: 'one',
    [MANY]: 'many',
    [DELETE]: 'delete',
  };
  config.supports.forEach((feature) => {
    if (typeof actionGenerators[feature] !== 'undefined') {
      actions[fns[feature]] = actionGenerators[feature](config);
    }
  });
  actions.invalidate = (ids = [], partial = false) =>
    ({ type: `GEN@${fullyQualified(config)}/INVALIDATE`, ids, partial });
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      actions[config.subresources[key].plural] =
        genActions(config.subresources[key], 2);
    });
  }
  actions.type = config.plural;
  return actions;
}

export function genDefaultState(config) {
  return {
    totalPages: -1,
    totalResults: -1,
    [config.plural]: {},
  };
}

function addMeta(config, item) {
  const subs = config.subresources ?
    _.reduce(config.subresources, (acc, conf, key) => (
      { ...acc, [key]: { ...genDefaultState(conf) } }), { })
    : undefined;
  return { ...item, _polling: false, ...subs };
}

export function genReducer(_config) {
  function one(config, state, action) {
    const previousId = action.ids[action.ids.length - 1];
    const previous = state[config.plural][previousId];
    const next = previous ? action.resource : addMeta(config, action.resource);
    const id = previousId !== undefined ? previousId : next.id;
    return {
      ...state,
      [config.plural]: {
        ...state[config.plural],
        [id]: {
          ...previous,
          ...next,
        },
      },
    };
  }

  function many(config, state, action) {
    const { page } = action;

    return {
      ...state,
      totalPages: page.total_pages,
      totalResults: page.total_results,
      [config.plural]: {
        ...state[config.plural],
        ...page[config.plural].reduce((s, i) =>
          ({
            ...s,
            [i.id]: state[config.plural][i.id] ? {
              ...state[config.plural][i.id],
              ...i,
            } : addMeta(config, i),
          }), { }),
      },
    };
  }

  function del(config, state, action) {
    const id = action.ids[action.ids.length - 1];
    return {
      ...state,
      [config.plural]: _.omit(state[config.plural], id),
    };
  }

  function invalidate(config, state, action) {
    let newState = { ...state };
    if (action.partial) {
      // Keep data but mark as invalid to be overwritten
      // when new data is available by thunks.all.
      if (action.ids.length) {
        // action.ids should only ever be just 1 id
        newState[config.plural][action.ids[0]].invalid = true;
      } else {
        newState.invalid = true;
      }
    } else {
      if (action.ids.length) {
        // action.ids should only ever be just 1 id
        delete newState[config.plural][action.ids[0]];
      } else {
        newState = genDefaultState(config);
      }
    }

    return newState;
  }

  function subresource(config, state, action) {
    let path = action.type.substr(action.type.indexOf('@') + 1);
    path = path.substr(0, path.indexOf('/'));
    const names = path.split('.');
    const { ids } = action;

    let name = null;
    let i;
    for (i = 0; i < names.length; i += 1) {
      if (names[i] === config.plural) {
        name = names[i + 1];
        break;
      }
    }

    if (!name) return state;

    if (i !== names.length - 2) {
      throw new Error('3-layer configs not supported');
    }

    const keys = Object.keys(config.subresources);
    let subkey = null;
    let subconfig = null;
    for (let i = 0; i < keys.length; i += 1) {
      subkey = keys[i];
      subconfig = config.subresources[subkey];
      if (subconfig.plural === name) {
        break;
      }
    }

    const subaction = { ...action, ids: ids.splice(1) };
    const item = state[config.plural][ids[0]];
    return one(config, state, {
      ids: action.ids,
      // eslint-disable-next-line no-use-before-define
      resource: { [subkey]: reducer(subconfig, item[subkey], subaction) },
    });
  }

  function reducer(config, state, action) {
    switch (action.type) {
      case `GEN@${fullyQualified(config)}/ONE`:
        return one(config, state, action);
      case `GEN@${fullyQualified(config)}/MANY`:
        return many(config, state, action);
      case `GEN@${fullyQualified(config)}/DELETE`:
        return del(config, state, action);
      case `GEN@${fullyQualified(config)}/INVALIDATE`:
        return invalidate(config, state, action);
      default:
        if (action.type && action.type.indexOf(`GEN@${config.plural}.`) === 0) {
          return subresource(config, state, action);
        }
        return state;
    }
  }

  const defaultState = genDefaultState(_config);
  return (state = defaultState, action) => reducer(_config, state, action);
}
