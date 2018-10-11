import { shallow } from 'enzyme';
import * as moment from 'moment';
import * as React from 'react';

import { paginationProps } from 'src/__data__/paginationProps';
import { personalAccessTokens } from 'src/__data__/personalAccessTokens';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import { APITokenTable } from './APITokenTable';

describe('APITokens', () => {

  const component = shallow(
    <APITokenTable
      {...paginationProps}
      count={4}
      classes={{
        headline: '',
        paper: '',
        labelCell: '',
        typeCell: '',
        createdCell: '',
      }}
      title="Personal Access Tokens"
      type="Personal Access Token"
      data={personalAccessTokens}
    />
  );

  it('should find a row for non-expired tokens', () => {
    expect(component.find('withRouter(WithStyles(WrappedTableRow))[data-qa-table-row="test-1"]').exists()).toBeFalsy();
    expect(component.find('withRouter(WithStyles(WrappedTableRow))[data-qa-table-row="test-2"]').exists()).toBeTruthy();
    expect(component.find('withRouter(WithStyles(WrappedTableRow))[data-qa-table-row="test-3"]').exists()).toBeTruthy();
  });

  it('should expect tokens to show in ascending order by created date', () => {
    const find = component.find('withRouter(WithStyles(WrappedTableRow))[data-qa-table-row]');
    expect(find.at(0).prop('data-qa-table-row')).toEqual('test-3');
    expect(find.at(1).prop('data-qa-table-row')).toEqual('test-2');
    expect(find.at(2).prop('data-qa-table-row')).toEqual('test-4');
  });
});

describe('create and edit tokens', () => {
  const pats = [
    {
      created: '2018-04-09T20:00:00',
      expiry: moment.utc().subtract(1, 'day').format(),
      id: 1,
      token: 'aa588915b6368b80',
      scopes: 'account:read_write',
      label: 'test-1',
    },
  ];

  const component = shallow(
    <LinodeThemeWrapper>
      <APITokenTable
        {...paginationProps}
        count={4}
        classes={{
          headline: '',
          paper: '',
          labelCell: '',
          typeCell: '',
          createdCell: '',
        }}
        title="Personal Access Tokens"
        type="Personal Access Token"
        data={pats}
      />
    </LinodeThemeWrapper>
  );

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('create token submit form should return false if label is blank', () => {
    (component.instance() as APITokenTable).createToken('*');
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('edit token submit form should return false if label is blank', () => {
    (component.instance() as APITokenTable).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('create token submit form should return no error state if label exists', () => {
    component.setState({
      form: {
        ...component.state().form,
        errors: undefined, // important that we reset the errors here after the previous tests
        values: {
          ...component.state().form.values,
          label: 'test label',
        },
      },
    });
    (component.instance() as APITokenTable).createToken('*');
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeFalsy();
  });

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('edit token submit form should return no error state if label exists', () => {
    (component.instance() as APITokenTable).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeFalsy();
  });
});
