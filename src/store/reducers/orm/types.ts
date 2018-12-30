import { AnyAction } from 'redux';

export type AsyncDispatch = <T>(action: AnyAction) => Promise<T>;

export type RequestThunk<R> = (dispatch: AsyncDispatch, getState: () => ApplicationState) => R;
