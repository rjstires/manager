import Axios from "axios";
import { Middleware, MiddlewareAPI } from "redux";
import { API_ROOT } from "src/constants";

export const signature = `@@request`;

/** For the life of me I cant type this. */
type State = any;

const requestMiddleware: Middleware = ({ getState }: MiddlewareAPI<State>) => (next) => (action: any) => {
  const { payload, meta } = action;
  const state: ApplicationState = getState();

  /**
   * Basic request details availalbe at meta['@@request']
   */
  if (!meta || !meta[signature]) {
    return next(action);
  }

  const { endpoint, method, actions } = meta[signature];
  const [start, finish, fail] = actions;

  const path = typeof endpoint === 'string' ? endpoint : endpoint(payload);

  let params = {};
  let data = {};
  if (method === 'POST' || method === 'PUT') {
    data = payload;
  }

  if (method === 'GET') {
    params = payload;
  }

  next(start())
  return Axios(
    `${API_ROOT}/${path}`,
    {
      method,
      params,
      headers: { Authorization: `Bearer ${state.authentication.token}` },
      data,
    },
  )
    .then(({ data }) => {
      (method === 'DELETE')
        ? next(finish(payload))
        : next(finish(data));
      return data;
    })
    .catch((err) => {
      try {
        next(fail(err));
        return Promise.reject(err);

      } catch (error) {
        return Promise.reject(error);
      }
    })
};

export default requestMiddleware;
