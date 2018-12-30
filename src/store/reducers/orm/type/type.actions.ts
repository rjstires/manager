import { actionCreatorFactory } from 'typescript-fsa';
import { RequestThunk } from '../types';

type Entity = Linode.LinodeType;

const actionCreator = actionCreatorFactory(`@@manager/orm/type`);

export const request = actionCreator(`request`);

export const finish = actionCreator<Entity[]>(`finish`);

export const fail = actionCreator(`fail`);

export const requestTypes = (): RequestThunk<Promise<Entity[]>> => async (dispatch) => {
  dispatch(request());

  try {

    const [types, legacyTypes] = await Promise.all([
      dispatch<Linode.ResourcePage<Entity>>({ type: `V4_REQUEST`, endpoint: `/linode/types` }),
      dispatch<Linode.ResourcePage<Entity>>({ type: `V4_REQUEST`, endpoint: `/linode/types-legacy` }),
    ])

    const result = [...types.data, ...legacyTypes.data];

    dispatch(finish(result));
    return result;
  }
  catch (err) {
    dispatch(fail(err));
    return err;
  }
};
