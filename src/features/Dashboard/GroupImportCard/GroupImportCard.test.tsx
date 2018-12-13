import { shallow } from 'enzyme';
import * as React from 'react';
import { GroupImportCard } from './GroupImportCard';

describe('GroupImportCard', () => {
  const mockFn = jest.fn();
  const wrapper = shallow(
    <GroupImportCard
      classes={{
        root: '',
        header: '',
        section: '',
        title: '',
        button: ''
      }}
      openImportDrawer={mockFn}
    />
  );

  it('renders without crashing', () => {
    expect(wrapper.find('WithStyles(DashboardCard)')).toHaveLength(1);
  });

  it('renders a header', () => {
    const header = wrapper.find('[data-qa-group-cta-header]');
    expect(header).toHaveLength(1);
    expect(header.children().text()).toBe('Import Your Display Group to Tags')
  });

  it('renders body text', () => {
    const body = wrapper.find('[data-qa-group-cta-body]');
    expect(body).toHaveLength(1);
  });

  it('renders a button', () => {
    expect(wrapper.find('WithStyles(wrappedButton)')).toHaveLength(1);
  });

  it('executes function on button click', () => {
    wrapper.find('WithStyles(wrappedButton)').simulate('click');
    expect(mockFn.mock.calls.length).toEqual(1);
  });
});