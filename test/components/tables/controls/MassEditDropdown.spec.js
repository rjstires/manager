import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { MassEditDropdown } from '~/components/tables/controls';


describe('components/tables/MassEditDropdown', function () {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should be defined', function () {
    expect(MassEditDropdown).to.be.defined;
  });

  it('should render a checkbox and a dropdown', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        options={[
          { name: 'Test', action: () => {} },
        ]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.find('input[type="checkbox"]').length).to.equal(1);
    expect(massEditDropdown.find('Dropdown').length).to.equal(1);
  });

  it('should have a default checked state', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        options={[
          { name: 'Test', action: () => {} },
        ]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.props().checked).to.equal(false);
  });

  it('should accept a checked state', function () {
    const massEditDropdown = mount(
      <MassEditDropdown
        checked
        options={[
          { name: 'Test', action: () => {} },
        ]}
        onChange={() => {}}
      />
    );

    expect(massEditDropdown.props().checked).to.equal(true);
  });

  it('should accept an onChange handler', function () {
    const onChange = sandbox.spy();
    const massEditDropdown = mount(
      <MassEditDropdown
        checked
        options={[
          { name: 'Test', action: () => {} },
        ]}
        onChange={onChange}
      />
    );

    massEditDropdown.find('input[type="checkbox"]').simulate('change');

    expect(onChange.callCount).to.equal(1);
    expect(onChange.getCall(0).args[0]).to.equal(true);
  });
});
