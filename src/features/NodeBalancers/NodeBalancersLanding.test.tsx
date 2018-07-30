import { mount } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { NodeBalancersLanding as _NodeBalancersLanding } from './NodeBalancersLanding';

describe('NodeBalancers', () => {
  const NodeBalancersLanding = withRouter(_NodeBalancersLanding);

    const component = mount(
    <StaticRouter context={{}}>
      <LinodeThemeWrapper>
        <NodeBalancersLanding
          classes={{ root: '', title: '', NBStatus: '' }}
          setDocs={setDocs}
          clearDocs={clearDocs}
          count={0}
          page={1}
          pageSize={25}
          loading={true}
          setPagination={jest.fn}
        />
      </LinodeThemeWrapper>
    </StaticRouter>,
  );

  it('should render 7 columns', () => {
    const numOfColumns = component
      .find('WithStyles(TableHead)')
      .find('WithStyles(TableCell)')
      .length;
    expect(numOfColumns).toBe(7);
  });

  it.skip('should render a Kabob menu', () => {
    const kabobMenu = component.find('withRouter(NodeBalancerActionMenu)')
      .first();
    expect(kabobMenu).toHaveLength(1);
  });

  it('trigger a confirmation modal when delete is selected', () => {
    //
  });
});
