import { metaGenerator } from 'src/store/request/request.helpers';
import { PagedPayload } from 'src/store/request/request.types';
import { actionCreatorFactory } from 'typescript-fsa';
import { RequestThunk } from '../types';

type Entity = Linode.Volume;

/**
 * Create Volume
 */
const createVolumeActionCreator = actionCreatorFactory(`@@manager/request/volume/create`);
export const createVolumeStart = createVolumeActionCreator(`start`);
export const createVolumeFinish = createVolumeActionCreator<Entity>(`finish`);
export const createVolumeFail = createVolumeActionCreator<Error>(`fail`);

const createVolumeMeta = metaGenerator({
  endpoint: '/volumes',
  entity: 'volume',
  method: 'POST',
  actions: [
    createVolumeStart,
    createVolumeFinish,
    createVolumeFail,
  ],
});

interface CreateVolumePayload {
  label: string,
  size?: number,
  region?: string,
  linode_id?: number,
  config_id?: number,
  tags?: string[],
}

export type CreateVolumeRequest = (payload: CreateVolumePayload) => Promise<Entity>;

export const createVolumeRequest = createVolumeActionCreator(`request`, createVolumeMeta);

/**
 * Request page of volumes.
 */
const getPageActionCreator = actionCreatorFactory(`@@manager/request/volume/get-page`);
export const requestVolumePageStart = getPageActionCreator('start');
export const requestVolumePageFinish = getPageActionCreator<Entity>('finish');
export const requestVolumePageFail = getPageActionCreator<Error>('fail');

const requestVolumePageMeta = metaGenerator<Entity>({
  endpoint: '/volumes',
  entity: 'volume',
  method: 'GET',
  actions: [
    requestVolumePageStart,
    requestVolumePageFinish,
    requestVolumePageFail,
  ],
});

export const requestVolumePage = getPageActionCreator<PagedPayload>(`request`, requestVolumePageMeta);

/**
 * Request all pages of volumes.
 */
const getAllActionCreator = actionCreatorFactory(`@@manager/request/volume/get-all`);
export const getAllVolumesRequest = getAllActionCreator(`request`);
export const getAllVolumesRequestFinish = getAllActionCreator<Entity[]>(`finish`);
export const getAllVolumesRequestFail = getAllActionCreator<Error>(`fail`);

export const requestVolumes = (page: number = 0, prevData: Entity[] = []): RequestThunk<Promise<Entity[]>> => async (dispatch) => {
  dispatch(getAllVolumesRequest());

  try {
    const result = await dispatch<Linode.ResourcePage<Entity>>(requestVolumePage({ page, page_size: 100 }));

    const { data, page: currentPage, pages } = result;

    if (currentPage < pages) {
      return dispatch(requestVolumes(currentPage + 1, [...prevData, ...data]));
    }

    dispatch(getAllVolumesRequestFinish([...prevData, ...data]));
    return result;
  }
  catch (err) {
    dispatch(getAllVolumesRequestFail(err));
    return err;
  }
};

/**
 * Update a volume.
 */
const updateVolumeActionCreator = actionCreatorFactory(`@@manager/request/volume/update`);
export const updateVolumeRequestStart = updateVolumeActionCreator('start');
export const updateVolumeRequestFinish = updateVolumeActionCreator<Entity>('finish');
export const updateVolumeRequestFail = updateVolumeActionCreator<Error>('fail');

interface UpdateVolumePayload {
  id: number;
  label: string;
  tags?: string[];
}

const updateVolumeMeta = metaGenerator<Entity, UpdateVolumePayload>({
  method: 'PUT',
  entity: 'volume',
  endpoint: (payload) => `/volumes/${payload.id}`,
  actions: [
    updateVolumeRequestStart,
    updateVolumeRequestFinish,
    updateVolumeRequestFail,
  ],
});

export type UpdateVolumeRequest = (payload: UpdateVolumePayload) => Promise<Entity>

export const updateVolumeRequest = updateVolumeActionCreator<UpdateVolumePayload>('request', updateVolumeMeta)

/**
 * Delete a volume.
 */
const deleteVolumeActionCreator = actionCreatorFactory(`@@manager/request/volume/delete`);
export const deleteVolumeRequestStart = deleteVolumeActionCreator('start');
export const deleteVolumeRequestFinish = deleteVolumeActionCreator<Entity>('finish');
export const deleteVolumeRequestFail = deleteVolumeActionCreator<Error>('fail');

const deleteVolumeMeta = metaGenerator<Entity, number>({
  method: 'DELETE',
  entity: 'volume',
  endpoint: (id) => `/volumes/${id}`,
  actions: [
    deleteVolumeRequestStart,
    deleteVolumeRequestFinish,
    deleteVolumeRequestFail,
  ],
});

export type DeleteVolumeRequest = (payload: number) => Promise<Entity>

export const deleteVolumeRequest = deleteVolumeActionCreator<number>('request', deleteVolumeMeta)
