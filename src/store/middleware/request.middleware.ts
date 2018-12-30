import Axios from "axios";
import { Middleware, MiddlewareAPI } from "redux";
import { API_ROOT } from "src/constants";

/** For the life of me I cant type this. */
type State = any;

const requestMiddleware: Middleware = ({ getState }: MiddlewareAPI<State>) => (next) => (action: any) => {
  const { type } = action;
  const state: ApplicationState = getState();

  if (type !== 'V4_REQUEST') {
    return next(action);
  }

  const {
    endpoint,
    method = 'GET',
    params = {},
    headers = {},
  } = action;


  return Axios(
    `${API_ROOT}/${endpoint}`,
    {
      method,
      params,
      headers: { ...headers, Authorization: `Bearer ${state.authentication.token}` },
    },
  )
    .then(({ data }) => data)
};

export default requestMiddleware;
