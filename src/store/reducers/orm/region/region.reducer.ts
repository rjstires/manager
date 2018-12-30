import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { defaultState, session } from '..';
import { finish } from './region.actions';

type State = ApplicationState['orm']['region'];

const reducer: Reducer<State> = (state = defaultState.region, action) => {
  const { Region } = session;

  if (isType(action, finish)) {
    const { payload } = action;

    for (const region of payload) {
      Region.create(region);
    }

    return {
      loading: false,
      data: session.state.Region,
      lastUpdated: Date.now(),
    };
  }

  return state;
};

export default reducer;
