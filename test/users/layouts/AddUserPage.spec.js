import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { CreatePage } from '~/users/layouts/CreatePage';

describe('users/layouts/CreatePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('renders UserForm', () => {
    const page = shallow(
      <CreatePage
        dispatch={dispatch}
      />
    );

    expect(page.find('UserForm').length).to.equal(1);
  });

  it('should commit changes to the API', async () => {
    const page = shallow(
      <CreatePage
        dispatch={dispatch}
      />
    );

    dispatch.reset();
    const values = {
      username: 'theUser',
      email: 'user@example.com',
      password: 'password',
      restricted: true,
    };
    await page.instance().onSubmit(values);
    expect(dispatch.callCount).to.equal(2);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(
      fn, '/account/users/', {
        method: 'POST',
        body: { ...values },
      }
    );
  });
});
