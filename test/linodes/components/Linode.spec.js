import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { Linode } from '~/linodes/components/Linode';
import { testLinode } from '@/data/linodes';

describe('linodes/components/Linode', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders a link to the Linode detail page', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.find('.PrimaryTable-row .PrimaryTable-rowLabel').props().to)
      .to.equal('/linodes/test-linode');
  });

  it('renders the IP addresses', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.find('#ips').contains('97.107.143.99'))
      .to.equal(true);
    expect(linode.find('#ips').contains('2600:3c03::f03c:91ff:fe0a:1dbe'))
      .to.equal(true);
  });

  it('renders the datacenter', () => {
    const datacenter = 'Newark, NJ';
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.contains(datacenter))
      .to.equal(true);
    expect(linode.find('.datacenter-style').find('img').props())
      .to.have.property('alt')
      .to.equal(datacenter);
  });

  it('renders the selected class', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected
      />);

    expect(linode.find('.PrimaryTable-row--selected').length).to.equal(1);
  });

  it('invokes the onSelect function when the checkbox is toggled', () => {
    const onSelect = sandbox.spy();
    const linode = mount(
      <Linode
        linode={testLinode}
        isSelected={false}
        onSelect={onSelect}
      />);

    expect(linode.find('input[type="checkbox"]').length).to.equal(1);
    linode.find('input[type="checkbox"]').simulate('change');

    expect(onSelect.calledOnce).to.equal(true);
  });
});
