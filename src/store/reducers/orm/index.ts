import { combineReducers } from 'redux';
import { ORM, ORMCommonState, TableState } from 'redux-orm';
import { model as Region, reducer as regionReducer } from './region';
import { model as Type, reducer as typeReducer } from './type';

/**
 * This describes the state of the database.
 * Without this interface we loose intelisense on orm instance methods (session, emptyState).
 */
interface IState extends ORMCommonState {
  Region: TableState<Linode.Region>;
  Type: TableState<Linode.LinodeType>;
}

/**
 * This describes the models
 */
interface IModels {
  region: typeof Region;
  type: typeof Type;
}

export const orm = new ORM<IState>();

orm.register<IModels>(Region, Type);

export const emptyState = orm.getEmptyState();

export const session = orm.session(emptyState);

const createLoadable = <T, M = any>(data: TableState): LoadableTable<T, M> => ({
  loading: true,
  error: undefined,
  lastUpdated: 0,
  data,
});

export const defaultState: ApplicationState['orm'] = {
  region: createLoadable<Linode.Region>(emptyState.Region),
  type: createLoadable<Linode.LinodeType>(emptyState.Type),
}

export default combineReducers({
  region: regionReducer,
  type: typeReducer,
});
