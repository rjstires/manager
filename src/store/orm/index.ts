import { combineReducers } from 'redux';
import { ORM, ORMCommonState, TableState } from 'redux-orm';
import { model as Region, reducer as regionReducer } from './region';
import { model as Type, reducer as typeReducer } from './type';
import { model as Volume, reducer as volumeReducer } from './volume';

/**
 * This describes the state of the database.
 * Without this interface we loose intelisense on orm instance methods (session, emptyState).
 */
export interface IState extends ORMCommonState {
  region: TableState<Linode.Region>;
  type: TableState<Linode.LinodeType>;
  volume: TableState<Linode.Volume>;
}

/**
 * This describes the models
 */
interface IModels {
  region: typeof Region;
  type: typeof Type;
  volume: typeof Volume;
}

export const orm = new ORM<IState>();

orm.register<IModels>(Region, Type, Volume);

export const emptyState = orm.getEmptyState();

export const session = orm.session(emptyState);

export const defaultState: ApplicationState['orm'] = {
  region: emptyState.region,
  type: emptyState.type,
  volume: emptyState.volume,
}

export default combineReducers({
  region: regionReducer,
  type: typeReducer,
  volume: volumeReducer,
});
