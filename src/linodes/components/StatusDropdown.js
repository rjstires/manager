import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import Dropdown from 'linode-components/dist/dropdowns/Dropdown';
import ConfirmModalBody from 'linode-components/dist/modals/ConfirmModalBody';
import DeleteModalBody from 'linode-components/dist/modals/DeleteModalBody';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { actions } from '~/api/generic/linodes';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/ad-hoc/linodes';
import Polling from '~/api/polling';
import { dispatchOrStoreErrors } from '~/api/util';
import { LinodeStates, LinodeStatesReadable } from '~/constants';

import ConfigSelectModalBody from './ConfigSelectModalBody';
import { launchWeblishConsole } from './WeblishLaunch';


const RANDOM_PROGRESS_MAX = 20;
const RANDOM_PROGRESS_MIN = 5;

function randomInitialProgress() {
  return Math.random() * (RANDOM_PROGRESS_MAX - RANDOM_PROGRESS_MIN) + RANDOM_PROGRESS_MIN;
}

function setProgress(linode, progress) {
  return (dispatch) => {
    const safeProgress = linode.__progress || 0;
    const progressIncreasingOrZero = progress === 0 ? 0 : Math.max(safeProgress, progress);
    return dispatch(actions.one({ __progress: progressIncreasingOrZero }, linode.id));
  };
}

function fetchLinodes(...ids) {
  return async (dispatch, getState) => {
    const allLinodes = Object.values(getState().api.linodes.linodes);
    const linodes = allLinodes.filter(l => ids.indexOf(l.id.toString()) !== -1);
    await dispatch(api.linodes.all([], null, {
      '+or': linodes.map(({ label }) => ({ label })),
    }));

    await Promise.all(linodes.map(linode => {
      // Increment progress with max of 95% growing smaller over time.
      const increase = 200 / linode.__progress;
      const newProgress = Math.min(linode.__progress ? linode.__progress + increase : 1, 95);
      return dispatch(setProgress(linode, newProgress));
    }));
  };
}

function onMaxPollingReached() {
  // TODO: error state
}

const POLLING = Polling({
  apiRequestFn: fetchLinodes,
  timeout: 2500,
  maxTries: 20,
  onMaxTriesReached: onMaxPollingReached,
});

export default class StatusDropdown extends Component {
  constructor() {
    super();

    this.state = {
      open: false,
      hiddenClass: '',
      errors: { _: {} },
    };
  }

  componentDidMount() {
    const { linode } = this.props;

    const isPending = LinodeStates.pending.indexOf(linode.status) !== -1;
    const isPolling = POLLING.isPolling(linode.id);

    if (isPending && !isPolling) {
      this.startLinodePolling();
    }
  }

  componentWillReceiveProps() {
    if ((Date.now() - this.state.lastErrorTime) > 3000) {
      this.setState({ errors: { _: {} } });
    }
  }

  componentWillUpdate(nextProps) {
    const { linode, dispatch } = nextProps;

    const isPending = LinodeStates.pending.indexOf(linode.status) !== -1;
    const isPolling = POLLING.isPolling(linode.id);
    const inEndingState = [undefined, 0, 100].indexOf(linode.__progress) === -1;

    if (isPending && !isPolling) {
      this.startLinodePolling();
    } else if (!isPending && (isPolling || inEndingState)) {
      POLLING.stop(linode.id);
      dispatch(setProgress(linode, 100));

      setTimeout(() => {
        // Reset it back to zero after giving it time to fade away without animating back to 0.
        this.setState({ hiddenClass: 'hidden' });

        setTimeout(() => {
          dispatch(setProgress(linode, 0));
          // Since this hidden-ness is set in state, it may be the case
          // that the bar animates back to 0 on a page change.
          this.setState({ hiddenClass: '' });
        }, 10);
      }, 1200); // A little bit longer than the width transition time.
    }
  }

  close = () => {
    this.setState({ open: false });
  };

  confirmAction = (name, onConfirm) => {
    const { linode, dispatch } = this.props;

    const title = `Confirm ${name}`;
    return dispatch(showModal(title, (
      <ConfirmModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={() => {
          onConfirm();
          dispatch(hideModal());
        }}
        analytics={{ title }}
      >
        Are you sure you want to {name.toLowerCase()} <strong>{linode.label}</strong>?
      </ConfirmModalBody>
    )));
  }

  deleteLinode = () => {
    const { linode, dispatch } = this.props;

    dispatch(showModal('Delete Linode', (
      <DeleteModalBody
        onSubmit={async function () {
          await dispatch(api.linodes.delete(linode.id));
          await dispatch(push('/'));
        }}
        items={[linode.label]}
        typeOfItem="Linode"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  open = () => {
    this.setState({ open: !this.state.open });
  };

  powerOffLinode = () => this.confirmAction('Power Off',
    () => this.props.dispatch(dispatchOrStoreErrors.call(this, [
      () => powerOffLinode(this.props.linode.id),
    ])));
  powerOnLinode = () => this.selectConfig(
    (linode, config) => this.props.dispatch(dispatchOrStoreErrors.call(this, [
      () => powerOnLinode(linode, config),
    ])));
  rebootLinode = () => this.confirmAction('Reboot', () => this.selectConfig(
    (linode, config) => this.props.dispatch(dispatchOrStoreErrors.call(this, [
      () => rebootLinode(linode, config),
    ]))));

  selectConfig = async (callback) => {
    const { linode, dispatch } = this.props;

    let configs = linode._configs.configs;
    if (isEmpty(configs)) {
      const res = await dispatch(api.linodes.configs.all([linode.id]));
      linode._configs = res;
      configs = res.configs;
    }
    const configCount = Object.keys(configs).length;

    if (configCount === 1) {
      callback(linode.id, parseInt(Object.keys(configs)[0]) || null);
      dispatch(hideModal());
      return;
    }

    const title = 'Select Configuration Profile';
    return dispatch(showModal(title, (
      <ConfigSelectModalBody
        linode={linode}
        title={title}
        dispatch={dispatch}
        action={callback}
      />
    )));
  }

  startLinodePolling() {
    const { linode, dispatch } = this.props;

    POLLING.reset();
    dispatch(POLLING.start(linode.id));
    dispatch(setProgress(linode, 1));

    // The point of this is to give time for bar to animate from beginning.
    // Important for this to happen last otherwise we end up in an infinite loop.
    setTimeout(() => dispatch(setProgress(linode, randomInitialProgress())), 10);
  }

  linodeToGroups = linode => {
    const status = linode.status;
    // we always show the current status
    const finalGroups = [{
      elements: [
        { name: LinodeStatesReadable[status] || capitalize(status) },
      ],
    }];
    const transitionStates = [
      'shutting_down',
      'booting',
      'provisioning',
      'rebooting',
      'rebuilding',
      'restoring',
      'migrating',
    ];

    // don't allow power actions in a transition state
    if (!(find(transitionStates, el => el === status))) {
      if (status !== 'offline') {
        finalGroups.push({
          elements: [
            { name: 'Reboot', action: this.rebootLinode },
            { name: 'Power Off', action: this.powerOffLinode },
          ],
        });
      } else {
        finalGroups.push({
          elements: [
            { name: 'Power On', action: this.powerOnLinode },
          ],
        });
      }
    }
    // we always allow Lish
    finalGroups.push({
      elements: [
        { name: 'Launch Console', action: () => launchWeblishConsole(linode) },
      ],
    });
    // we always allow deletion
    finalGroups.push({
      elements: [
        { name: 'Delete', action: this.deleteLinode },
      ],
    });
    return finalGroups;
  }

  render() {
    const { linode } = this.props;
    const { errors } = this.state;

    const groups = this.linodeToGroups(linode, errors);

    // The calc(x + 1px) is needed because we have left: -1px on this element.
    const progressWidth = `calc(${linode.__progress}%${linode.__progress === 0 ? '' : ' + 1px'})`;

    return (
      <div>
        <div className="StatusDropdown StatusDropdown--dropdown">
          <Dropdown
            groups={groups}
            duplicateFirst={false}
            analytics={{ title: 'Linode actions' }}
          />
          <div className="StatusDropdown-container">
            <div
              style={{ width: progressWidth }}
              className={`StatusDropdown-progress ${this.state.hiddenClass}`}
            />
          </div>
        </div>
        {!isEmpty(errors._) &&
          <FormGroup
            className={`m-0 p-0 ${isEmpty(errors._) ? 'height-pulse' : 'd-none'}`}
            errors={errors}
            name="_"
          >
            <FormGroupError className="m-0 p-0" errors={errors} name="_" />
          </FormGroup>
        }
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func,
};
