import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import Table from 'linode-components/dist/tables/Table';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LinkCell from 'linode-components/dist/tables/cells/LinkCell';
import ThumbnailCell from 'linode-components/dist/tables/cells/ThumbnailCell';
import { compose } from 'redux';

import { ComponentPreload as Preload } from '~/decorators/Preload';

import { setAnalytics, setSource } from '~/actions';
import toggleSelected from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { getEmailHash } from '~/cache';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import CreateHelper from '~/components/CreateHelper';
import { GRAVATAR_BASE_URL } from '~/constants';
import { confirmThenDelete } from '~/utilities';

import { AddUser } from '../components';


const OBJECT_TYPE = 'users';

function getGravatarURL(user) {
  const emailHash = getEmailHash(user.email);
  return `${GRAVATAR_BASE_URL}${emailHash}`;
}

export class IndexPage extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['users']));
  }

  deleteUsers = confirmThenDelete(
    this.props.dispatch,
    'user',
    api.users.delete,
    OBJECT_TYPE,
    'username',
    'delete',
    'deleting',
    'username').bind(this)

  renderUsers(users) {
    const { dispatch, selectedMap, profile: { username: currentUsername } } = this.props;
    const { filter } = this.state;

    const { sorted: sortedUsers } = transform(users, {
      filterBy: filter,
      filterOn: 'username',
    });

    return (
      <List>
        <ChainedDocumentTitle title="Users" />
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedUsers}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteUsers },
              ] }]}
              selectedMap={selectedMap}
              selectedKey="username"
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              {
                cellComponent: CheckboxCell,
                headerClassName: 'CheckboxColumn',
                selectedKey: 'username',
              },
              {
                cellComponent: ThumbnailCell,
                headerClassName: 'ThumbnailColumn',
                srcFn: getGravatarURL,
              },
              {
                cellComponent: LinkCell,
                idKey: 'username',
                hrefFn: (user) =>
                  user.username !== currentUsername ? `/users/${user.username}` : '/profile',
                textKey: 'username',
                tooltipEnabled: true,
              },
              { dataKey: 'email' },
              { dataFn: (user) => user.restricted ? 'Restricted' : 'Unrestricted' },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                text: 'Delete',
                onClick: (user) => { this.deleteUsers(user); },
              },
            ]}
            noDataMessage="No users found."
            data={sortedUsers}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(user) => {
              dispatch(toggleSelected(OBJECT_TYPE, user.username));
            }}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch } = this.props;

    const addUser = () => AddUser.trigger(dispatch);

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Users</h1>
            <PrimaryButton onClick={addUser} className="float-right">
              Add a User
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.users.users).length ?
            this.renderUsers(this.props.users.users) :
            <CreateHelper label="Users" onClick={addUser} linkText="Add a User" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  users: PropTypes.object,
  profile: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    users: state.api.users,
    profile: state.api.profile,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

const preloadRequest = async (dispatch) => {
  // Restricted users will get a 403 on /v4/profile/users
  const onReject = reason => reason.status !== 403 ? Promise.reject(reason) : null;
  await dispatch(api.users.all()).catch(onReject);
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(IndexPage);
