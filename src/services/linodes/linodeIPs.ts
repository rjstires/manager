import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

import { IPAllocationSchema } from './linode.schema';

type IPAddress = Linode.IPAddress;

export interface IPAllocationRequest {
  type: 'ipv4';
  public: boolean;
}

/**
 * getLinodeIPs
 *
 * Return a list of IP addresses allocated to this Linode.
 *
 * @param linodeId { number } The id of the Linode whose addresses you would like to retrieve.
 */
export const getLinodeIPs = (id: number) =>
  Request<Linode.LinodeIPsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/ips`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * allocateIPAddress
 *
 * Allocates a public or private IPv4 address to a Linode
 *
 * @param linodeId { number } The id of the Linode to receive a new IP address.
 * @param data { object }
 * @param data.type { string } Must be "ipv4", as currently only IPv4 addresses can be allocated.
 * @param data.public { boolean } True for a public IP address, false for a private address.
 */
export const allocateIPAddress = (
  linodeID: number,
  data: IPAllocationRequest
) =>
  Request<IPAddress>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/ips`),
    setMethod('POST'),
    setData(data, IPAllocationSchema)
  ).then(response => response.data);
