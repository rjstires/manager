import { actionCreatorFactory } from 'typescript-fsa';
import { RequestThunk } from '../types';

type Entity = Linode.Region;

const actionCreator = actionCreatorFactory(`@@manager/orm/region`);

export const request = actionCreator(`request`);

export const finish = actionCreator<Entity[]>(`finish`);

export const fail = actionCreator(`fail`);

export const requestRegions = (): RequestThunk<Promise<Entity[]>> => async (dispatch) => {
  dispatch(request());

  try {
    const response = await dispatch<Linode.ResourcePage<Entity>>({
      type: `V4_REQUEST`,
      endpoint: `/regions`,
    });
    const { data } = response;
    dispatch(finish(data));
    return data;
  }
  catch (err) {
    dispatch(fail(err));
    return err;
  }
};
