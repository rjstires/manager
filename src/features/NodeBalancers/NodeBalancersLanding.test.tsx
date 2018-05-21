import * as React from 'react';
import { shallow } from 'enzyme';

import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { NodeBalancersLanding } from './NodeBalancersLanding';
import { setDocs, clearDocs } from 'src/store/reducers/documentation';

describe('NodeBalancers', () => {
  const dummyNodeBalancers = createPromiseLoaderResponse<Linode.ExtendedNodeBalancer[]>([
    {
      transfer: {
        total: 9.492830276489258,
        out: 0.471893310546875,
        in: 9.020936965942383,
      },
      created: '2018-05-18T17:58:39',
      label: 'balancer34999',
      ipv6: '2600:3c00:1::68c8:16ae',
      hostname: 'nb-104-200-22-174.dallas.nodebalancer.linode.com',
      region: 'us-central',
      updated: '2018-05-18T18:37:41',
      ipv4: '104.200.22.174',
      id: 34999,
      client_conn_throttle: 0,
      up: 0,
      down: 0,
      ports: [80],
    },
    {
      transfer: {
        total: 66.79611110687256,
        out: 5.5901947021484375,
        in: 61.20591640472412,
      },
      created: '2018-05-04T18:37:25',
      label: 'balancer34740',
      ipv6: '2600:3c00:1::68c8:1688',
      hostname: 'nb-104-200-22-136.dallas.nodebalancer.linode.com',
      region: 'us-central',
      updated: '2018-05-17T16:44:34',
      ipv4: '104.200.22.136',
      id: 34740,
      client_conn_throttle: 0,
      up: 0,
      down: 0,
      ports: [80, 443],
    },
  ]);

  const component = shallow(
    <NodeBalancersLanding
      classes={{ root: '' }}
      setDocs={setDocs}
      clearDocs={clearDocs}
      nodeBalancers={dummyNodeBalancers}
    />,
  );

  it('should render 7 columns', () => {
    const numOfColumns = component
      .find('WithStyles(TableHead)')
      .find('WithStyles(TableCell)')
      .length;
    expect(numOfColumns).toBe(7);
  });

  it('should render a Kabob menu', () => {
    const kabobMenu = component.find('withRouter(NodeBalancerActionMenu)')
      .first();
    expect(kabobMenu).toHaveLength(1);
  });

  it('trigger a confirmation modal when delete is selected', () => {
    //
  });
});
