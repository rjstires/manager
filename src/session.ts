import { stringify } from 'querystring';
import { v4 } from 'uuid';

import { setToken } from 'src/actions/authentication';
import { CLIENT_ID, APP_ROOT, LOGIN_ROOT, OAUTH_TOKEN_REFRESH_INTERVAL } from 'src/constants';
import { getStorage, setStorage } from 'src/storage';
import store from 'src/store';
import { TodoAny } from 'src/utils';

const AUTH_TOKEN = 'authentication/oauth-token';
const AUTH_SCOPES = 'authentication/scopes';
const AUTH_EXPIRE_DATETIME = 'authentication/expire-datetime';

export function start(oauthToken = '', scopes = '', expires = '') {
  // Set these two so we can grab them on subsequent page loads
  setStorage(AUTH_TOKEN, oauthToken);
  setStorage(AUTH_SCOPES, scopes);
  setStorage(AUTH_EXPIRE_DATETIME, expires);

  // Add all to state for this (page load) session
  store.dispatch(setToken(oauthToken, scopes));
}

export function refresh(dispatch: TodoAny) {
  const authToken = getStorage(AUTH_TOKEN);
  const scopes = getStorage(AUTH_SCOPES);
  dispatch(setToken(authToken, scopes));
}

export function expire(dispatch: TodoAny) {
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage(AUTH_TOKEN, '');
  setStorage(AUTH_SCOPES, '');
  setStorage(AUTH_EXPIRE_DATETIME, '');
  dispatch(setToken(null, null));
}

export function initialize(dispatch: TodoAny) {
  const expires = getStorage(AUTH_EXPIRE_DATETIME) || null;
  if (expires && new Date(expires) < new Date()) {
    // Calling expire makes sure the full expire steps are taken.
    return dispatch(expire);
  }

  const token = getStorage(AUTH_TOKEN) || null;
  const scopes = getStorage(AUTH_SCOPES) || null;
  // Calling this makes sure AUTH_EXPIRES is always set.
  dispatch(start(token, scopes, expires));
}

export function genOAuthEndpoint(redirectUri: string, scope = '*', nonce: string) {
  const query = {
    client_id: CLIENT_ID,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce,
  };

  return `${LOGIN_ROOT}/oauth/authorize?${stringify(query)}`;
}

export function prepareOAuthEndpoint(redirectUri: string, scope = '*') {
  const nonce = v4();
  setStorage('authentication/nonce', nonce);
  return genOAuthEndpoint(redirectUri, scope, nonce);
}

export function redirectToLogin(path: string, querystring: string) {
  const redirectUri = `${path}${querystring && `%3F${querystring}`}`;
  window.location.href = prepareOAuthEndpoint(redirectUri);
}

export function refreshOAuthToken(dispatch: TodoAny) {
  /**
   * Open an iframe for two purposes
   * 1. Hits the login service (extends the lifetime of login session)
   * 2. Refreshes our OAuth token in localStorage
   */
  const iframe = document.createElement('iframe');
  iframe.src = prepareOAuthEndpoint('/null');
  iframe.style.display = 'none';
  const iframeContainer = document.getElementById('session-iframe');
  if (!iframeContainer) {
    throw new Error('no iframe container for oauth token refresh');
  }
  iframeContainer.appendChild(iframe);
  // Remove the iframe once it refreshes OAuth token in localStorage
  setTimeout(() => iframeContainer.removeChild(iframe), 5000);
  // Move the OAuth token from localStorage into Redux
  dispatch(refresh);
  // Do this again in a little while
  setTimeout(() => dispatch(refreshOAuthToken), OAUTH_TOKEN_REFRESH_INTERVAL);
}
