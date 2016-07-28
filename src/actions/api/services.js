import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_SERVICES = '@@services/UPDATE_SERVICES';

export const fetchServices = makeFetchPage(
    UPDATE_SERVICES, 'services');

export const fetchAllServices = makeFetchAll(
    fetchServices, 'services');
