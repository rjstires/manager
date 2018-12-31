import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { defaultState, session } from '..';
import { regionsRequestPageFinish } from './region.actions';

type State = ApplicationState['orm']['region'];

const reducer: Reducer<State> = (state = defaultState.region, action) => {
  const { region: Region } = session;

  if (isType(action, regionsRequestPageFinish)) {
    const { payload } = action;

    for (const region of payload.data) {
      Region.create(region);
    }
    return session.state.region;
  }
  return state;
};

export default reducer;
