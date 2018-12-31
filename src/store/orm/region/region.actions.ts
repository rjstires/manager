import { metaGenerator } from 'src/store/request/request.helpers';
import { PagedPayload } from 'src/store/request/request.types';
import { actionCreatorFactory } from 'typescript-fsa';

type Entity = Linode.Region;

/**
 * Request page of regions.
 */
const actionCreator = actionCreatorFactory(`@@manager/request/region/get-page`);

export const regionsRequestPageStart = actionCreator(`start`);

export const regionsRequestPageFinish = actionCreator<Linode.ResourcePage<Entity[]>>(`finish`);

export const regionsRequestPageFail = actionCreator<Error>(`fail`);

const requestRegionPageMeta = metaGenerator({
  endpoint: '/regions',
  entity: 'region',
  method: 'GET',
  actions: [
    regionsRequestPageStart,
    regionsRequestPageFinish,
    regionsRequestPageFail,
  ],
});

/**
 * Request all pages of regions
 */
const requestAllActionCreator = actionCreatorFactory(`@@manager/request/region/get-all`);

const requestRegionPage = requestAllActionCreator<PagedPayload>(`request`, requestRegionPageMeta);

export const requestRegions = () => requestRegionPage({});
