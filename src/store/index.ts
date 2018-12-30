import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import eventsMiddleware from './middleware/events';
import requestMiddleware from './middleware/request.middleware';
import authentication, { defaultState as authenticationDefaultState } from './reducers/authentication';
import backups, { defaultState as backupsDefaultState } from './reducers/backupDrawer';
import documentation, { defaultState as documentationDefaultState } from './reducers/documentation';
import domainDrawer, { defaultState as domainDrawerDefaultState } from './reducers/domainDrawer';
import events, { defaultState as eventsDefaultState } from './reducers/events';
import features, { defaultState as featuresDefaultState } from './reducers/features';
import notifications, { DEFAULT_STATE as notificationsDefaultState } from './reducers/notifications';
import orm, { defaultState as ormDefaultState } from './reducers/orm';
import __resources, { defaultState as resourcesDefaultState } from './reducers/resources';
import stackScriptDrawer, { defaultState as stackScriptDrawerDefaultState } from './reducers/stackScriptDrawer';
import tagImportDrawer, { defaultState as tagDrawerDefaultState } from './reducers/tagImportDrawer';
import volumeDrawer, { defaultState as volumeDrawerDefaultState } from './reducers/volumeDrawer';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  orm,
  __resources,
  authentication,
  backups,
  documentation,
  domainDrawer,
  events,
  features,
  notifications,
  stackScriptDrawer,
  tagImportDrawer,
  volumeDrawer,
});

const defaultState: ApplicationState = {
  orm: ormDefaultState,
  __resources: resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  documentation: documentationDefaultState,
  domainDrawer: domainDrawerDefaultState,
  events: eventsDefaultState,
  features: featuresDefaultState,
  notifications: notificationsDefaultState,
  stackScriptDrawer: stackScriptDrawerDefaultState,
  tagImportDrawer: tagDrawerDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
};

const middleware = applyMiddleware(
  requestMiddleware,
  thunk,
  eventsMiddleware,
)

const devtools = reduxDevTools ? reduxDevTools() : (f: any) => f

const enhancers = compose(middleware, devtools);

export default createStore(reducers, defaultState, enhancers);
