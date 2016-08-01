import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_SERVICES = '@@services/UPDATE_SERVICES';

export const servicesConfig = {
  singular: 'service',
  plural: 'services',
  actions: { update_many: UPDATE_SERVICES },
};

export const fetchServices = makeFetchPage(servicesConfig);
export const fetchAllServices = makeFetchAll(servicesConfig, fetchServices);
