import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { powerOnLinode, rebootLinode } from '~/api/ad-hoc/linodes';
import ConfigSelectModalBody from '~/linodes/components/ConfigSelectModalBody';

import { changeInput, expectDispatchOrStoreErrors } from '@/common';
import { api } from '@/data';


const { linodes } = api;

describe('linodes/components/ConfigSelectModalBody', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders power on button text', () => {
    const modal = shallow(
      <ConfigSelectModalBody
        linode={linodes.linodes['1238']}
        action={powerOnLinode}
      />
    );

    expect(modal.props().buttonText).to.equal('Power On');
  });

  it('renders reboot button text', () => {
    const modal = shallow(
      <ConfigSelectModalBody
        linode={linodes.linodes['1238']}
        action={rebootLinode}
      />
    );

    expect(modal.props().buttonText).to.equal('Reboot');
  });

  it('renders config list', () => {
    const linode = linodes.linodes['1238'];
    const modal = shallow(<ConfigSelectModalBody linode={linode} />);

    const configs = Object.values(linode._configs.configs);
    const elements = modal.find('Radio');
    expect(elements.length).to.equal(configs.length);

    for (let i = 0; i < configs.length; i++) {
      const element = elements.at(i);
      expect(element.props().label).to.equal(configs[i].label);
      expect(element.props().value).to.equal(configs[i].id);
    }
  });

  it('dispatches action when button is pressed', () => {
    const dispatch = sandbox.spy();
    const action = sandbox.stub().returns(42);

    const linode = linodes.linodes['1238'];

    const modal = mount(
      <ConfigSelectModalBody
        linode={linode}
        action={action}
        dispatch={dispatch}
      />
    );

    changeInput(modal, 'config', 321321);

    dispatch.reset();
    modal.find('FormModalBody').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      () => {
        expect(action.callCount).to.equal(1);
        expect(action.firstCall.args[0]).to.equal(linode.id);
        expect(action.firstCall.args[1]).to.equal(321321);
      },
    ]);
  });
});
