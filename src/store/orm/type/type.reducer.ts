import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { defaultState, session } from '..';
import { requestAllTypesFinish } from './type.actions';

type State = ApplicationState['orm']['type'];

const reducer: Reducer<State> = (state = defaultState.type, action) => {
  const { type: Type } = session;

  if (isType(action, requestAllTypesFinish)) {
    const { payload } = action;

    for (const type of payload) {
      Type.create(type);
    }
  }

  return session.state.type;
};

export default reducer;
