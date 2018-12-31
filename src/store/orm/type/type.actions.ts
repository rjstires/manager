import { metaGenerator } from 'src/store/request/request.helpers';
import { PagedPayload } from 'src/store/request/request.types';
import { actionCreatorFactory } from 'typescript-fsa';
import { RequestThunk } from '../types';

type Entity = Linode.LinodeType;

/**
 * Request page of types.
 */
const typesPageActionCreator = actionCreatorFactory(`@@manager/request/type/get-page`);
export const requestTypesPageStart = typesPageActionCreator(`start`);
export const requestTypesPageFinish = typesPageActionCreator<Entity[]>(`finish`);
export const requestTypesPageFail = typesPageActionCreator<Error>(`fail`);

const typesPageMeta = metaGenerator({
  method: 'GET',
  endpoint: '/linode/types',
  entity: 'type',
  actions: [
    requestTypesPageStart,
    requestTypesPageFinish,
    requestTypesPageFail,
  ],
});

const requestTypesPage = typesPageActionCreator<PagedPayload>(`request`, typesPageMeta);

/**
 * Request all pages of types.
 */
const typesLegacyPageActionCreator = actionCreatorFactory(`@@manager/request/type-legacy/get-page`);
export const requestTypesLegacyPageStart = typesLegacyPageActionCreator(`start`);
export const requestTypesLegacyPageFinish = typesLegacyPageActionCreator<Entity[]>(`finish`);
export const requestTypesLegacyPageFail = typesLegacyPageActionCreator<Error>(`fail`);

const typesLegacyPageMeta = metaGenerator({
  method: 'GET',
  endpoint: '/linode/types-legacy',
  entity: 'type',
  actions: [
    requestTypesLegacyPageStart,
    requestTypesLegacyPageFinish,
    requestTypesLegacyPageFail,
  ],
});

const requestTypesLegacyPage = typesLegacyPageActionCreator<PagedPayload>(`request`, typesLegacyPageMeta);

/**
 * Request all types.
 */
const requestAllTypesCreator = actionCreatorFactory(`@@manager/request/all-types/get-all`);
export const requestAllTypesStart = requestAllTypesCreator(`start`);
export const requestAllTypesFinish = requestAllTypesCreator<Entity[]>(`finish`);
export const requestAllTypesFail = requestAllTypesCreator<Error>(`fail`);

export const requestTypes = (): RequestThunk<Promise<Entity[]>> => async (dispatch) => {
  dispatch(requestAllTypesStart());

  try {
    const [types, legacyTypes] = await Promise.all([
      dispatch<Linode.ResourcePage<Entity>>(requestTypesPage({})),
      dispatch<Linode.ResourcePage<Entity>>(requestTypesLegacyPage({}))
    ])

    const result = [...types.data, ...legacyTypes.data];

    dispatch(requestAllTypesFinish(result));
    return result;
  }
  catch (err) {
    dispatch(requestAllTypesFail(err));
    return err;
  }
};
