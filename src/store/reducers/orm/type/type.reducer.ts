import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { defaultState, session } from '..';
import { finish } from './type.actions';

type State = ApplicationState['orm']['type'];

const reducer: Reducer<State> = (state = defaultState.type, action) => {
  const { Type } = session;

  if (isType(action, finish)) {
    const { payload } = action;

    for (const type of payload) {
      Type.create(type);
    }

    return {
      loading: false,
      data: session.state.Type,
      lastUpdated: Date.now(),
    };
  }

  return state;
};

export default reducer;
