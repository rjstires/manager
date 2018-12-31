import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { defaultState, session } from '..';
import { createVolumeFinish, deleteVolumeRequestFinish, getAllVolumesRequestFinish, updateVolumeRequestFinish } from './volume.actions';

type State = ApplicationState['orm']['volume'];

const reducer: Reducer<State> = (state = defaultState.volume, action) => {
  const { volume: Volume } = session;

  if (isType(action, getAllVolumesRequestFinish)) {
    const { payload } = action;

    for (const volume of payload) {
      Volume.create(volume);
    }
  }

  if (isType(action, createVolumeFinish)) {
    const { payload } = action;

    Volume.create(payload);
  }

  if (isType(action, updateVolumeRequestFinish)) {
    const { payload } = action;

    Volume.withId(payload.id.toString()).update(payload);
  }

  if (isType(action, deleteVolumeRequestFinish)) {
    const { payload } = action;

    Volume.withId(payload.toString()).delete();
  }

  return session.state.volume;
};

export default reducer;
