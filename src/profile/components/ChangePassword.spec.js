import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ChangePassword } from '~/profile/components';

import {
  changeInput,
  createSimulatedEvent,
  expectRequest,
  expectDispatchOrStoreErrors
} from '~/test.helpers';


describe('profile/components/ChangePassword', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('changes password', async () => {
    const page = mount(
      <ChangePassword
        dispatch={dispatch}
      />
    );

    page.find('input[name="password"]')
      .simulate('change', createSimulatedEvent('password', 'thePassword'));
    page.find('select[name="expires"]')
      .simulate('change', createSimulatedEvent('expires', 0));

    await page.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/profile/password', {
        method: 'POST',
        body: { password: 'thePassword' },
      }),
    ]);
  });
});
