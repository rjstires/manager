import { ActionCreator } from "typescript-fsa";

type SIGNATURE = `@@request`

/**
 * Methods
 */
type GET = 'GET';

type POST = 'POST';

type DELETE = 'DELETE';

type PUT = 'PUT';

type Method = GET | POST | DELETE | PUT;

/**
 * Entityes
 */
type LINODE = 'linode';

type VOLUME = 'volume';

type TYPE = 'type';

type REGION = 'region';

type TYPE_LEGACY = 'type_legacy';

type Entity =
  | LINODE
  | VOLUME
  | REGION
  | TYPE
  | TYPE_LEGACY;

/**
 * Base action
 */
interface Action<P> {
  type: string;
  payload: P;
  error?: boolean;
  meta: MetaRecord;
}

interface Meta<T = any, Payload = any> {
  method: Method;
  entity: Entity;
  endpoint: string | ((payload: Payload) => string);
  actions: [
    ActionCreator<void>,
    ActionCreator<T>,
    ActionCreator<Error>
  ],
}

type MetaRecord = Record<SIGNATURE, Meta>;

interface PagedPayload {
  page?: number;
  page_size?: number;
}
