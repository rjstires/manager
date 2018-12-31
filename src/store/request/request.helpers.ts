import { compose, Lens, lensPath } from 'ramda';
import { signature } from './request.middleware';
import { Action, Meta, MetaRecord } from './request.types';

export const isRequestAction = (action: any): action is Action<any> =>
  action && action.meta && action.meta[signature];

export const metaGenerator = <Type, Payload = any>(obj: Meta<Type, Payload>): MetaRecord => ({ [signature]: obj });

/** Lenses */
const error = lensPath(['error']);
const loading = lensPath(['loading']);

const create = lensPath(['create']);
const createError = compose(create, error)
const createLoading = compose(create, loading)

const read = lensPath(['read']);
const readError = compose(read, error)
const readLoading = compose(read, loading)

const update = lensPath(['update']);
const updateError = compose(update, error)
const updateLoading = compose(update, loading)

const _delete = lensPath(['delete']);
const _deleteError = compose(_delete, error)
const _deleteLoading = compose(_delete, loading)

const region = lensPath(['region']);
export const regionReadLoading = compose(region, readLoading) as Lens;
export const regionReadError = compose(region, readError) as Lens;

const type = lensPath(['type']);
export const typeReadLoading = compose(type, readLoading) as Lens;
export const typeReadError = compose(type, readError) as Lens;

const volume = lensPath(['volume']);
export const volumeCreateLoading = compose(volume, createLoading) as Lens;
export const volumeCreateError = compose(volume, createError) as Lens;

export const volumeReadLoading = compose(volume, readLoading) as Lens;
export const volumeReadError = compose(volume, readError) as Lens;

export const volumeUpdateLoading = compose(volume, updateLoading) as Lens;
export const volumeUpdateError = compose(volume, updateError) as Lens;

export const volumeDeleteLoading = compose(volume, _deleteLoading) as Lens;
export const volumeDeleteError = compose(volume, _deleteError) as Lens;


export const updater = <T>(...fns: Function[]) => (state: T) => fns.reduceRight((result, fn) => fn(result), state)

export { set } from 'ramda';

