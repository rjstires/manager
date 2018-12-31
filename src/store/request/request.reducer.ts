import { Lens } from 'ramda';
import { Reducer } from 'redux';
import { regionsRequestPageFail, regionsRequestPageFinish, regionsRequestPageStart } from 'src/store/orm/region/region.actions';
import { requestAllTypesFail, requestAllTypesFinish, requestAllTypesStart } from 'src/store/orm/type/type.actions';
import { createVolumeFail, createVolumeFinish, createVolumeStart, deleteVolumeRequestFail, deleteVolumeRequestFinish, deleteVolumeRequestStart, getAllVolumesRequest, getAllVolumesRequestFail, getAllVolumesRequestFinish, updateVolumeRequest, updateVolumeRequestFinish, updateVolumeRequestStart } from 'src/store/orm/volume/volume.actions';
import { ActionCreator, isType } from 'typescript-fsa';
import { regionReadError, regionReadLoading, set, typeReadError, typeReadLoading, updater, volumeCreateError, volumeCreateLoading, volumeDeleteError, volumeDeleteLoading, volumeReadError, volumeReadLoading, volumeUpdateError, volumeUpdateLoading } from './request.helpers';

type State = ApplicationState['requests'];

const defaultStatus = { loading: false, error: undefined };

export const defaultState: State = {
  region: {
    read: defaultStatus,
  },
  type: {
    read: defaultStatus,
  },
  volume: {
    create: defaultStatus,
    read: defaultStatus,
    update: defaultStatus,
    delete: defaultStatus,
  },
};

/**
 * [ loadingLens, errorLens ]
 * [ startActionCreator, finishActionCreator, failActionCreator ]
 */
type RequestGroup = [Lens[], ActionCreator<any>[]];
const thingies: RequestGroup[] = [
  [
    [regionReadLoading, regionReadError],
    [regionsRequestPageStart, regionsRequestPageFinish, regionsRequestPageFail]
  ],
  [
    [typeReadLoading, typeReadError],
    [requestAllTypesStart, requestAllTypesFinish, requestAllTypesFail]
  ],
  [
    [volumeReadLoading, volumeReadError],
    [getAllVolumesRequest, getAllVolumesRequestFinish, getAllVolumesRequestFail]
  ],
  [
    [volumeCreateLoading,volumeCreateError],
    [createVolumeStart, createVolumeFinish, createVolumeFail],
  ],
  [
    [volumeDeleteLoading,volumeDeleteError],
    [deleteVolumeRequestStart, deleteVolumeRequestFinish, deleteVolumeRequestFail],
  ],
  [
    [volumeUpdateLoading, volumeUpdateError],
    [updateVolumeRequestStart, updateVolumeRequestFinish, updateVolumeRequest],
  ],
];

const reducer: Reducer<State> = (state = defaultState, action) => {
  for (const thing of thingies) {
    const [lenses, actions] = thing;
    const [loading, error] = lenses;
    const [start, finish, fail] = actions;

    if (isType(action, start)) {
      const updates = updater(
        set(loading, true),
      );

      return updates(state);
    }

    if (isType(action, finish)) {
      const updates = updater(
        set(loading, false),
      );

      return updates(state)
    }

    if (isType(action, fail)) {
      const updates = updater(
        set(loading, false),
        set(error, action.payload),
      );

      return updates(state)
    }

  }

  return state;
}

export default reducer;
