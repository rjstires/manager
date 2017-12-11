import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import { configsNodeBalancer } from '~/data/nodebalancers';
import { DashboardPage } from '~/nodebalancers/nodebalancer/configs/layouts/DashboardPage';

describe('nodebalancers/nodebalancer/configs/layouts/DashboardPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.stub();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const wrapper = shallow(
      <DashboardPage
        config={configsNodeBalancer._configs.configs[1]}
        nodebalancer={configsNodeBalancer}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('displays the config view summary', async () => {
    const page = await mount(
      <DashboardPage
        config={configsNodeBalancer._configs.configs[1]}
        nodebalancer={configsNodeBalancer}
      />
    );
    const port = page.find('#port').at(0).text();
    const portFromApi = configsNodeBalancer._configs.configs[1].port;
    const nodesFromApi = configsNodeBalancer._configs.configs[1]._nodes.nodes;
    expect(parseInt(port)).toBe(portFromApi);
    const nodeRows = page.find('.TableRow');
    const nodeValues = nodeRows.at(0).find('td');
    expect(nodeValues.length).toBe(7);
    [
      nodesFromApi[1].label,
      nodesFromApi[1].address,
      nodesFromApi[1].weight,
      nodesFromApi[1].mode,
      nodesFromApi[1].status,
    ].forEach((value, i) => {
      expect(value.toString()).toBe(nodeValues.at(i).text().toLowerCase());
    });
  });
});
