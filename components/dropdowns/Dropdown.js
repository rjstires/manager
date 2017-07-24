import { PropTypes } from 'prop-types';
import React, { Component } from 'react';

import { EmitEvent, DROPDOWN_OPEN, DROPDOWN_CLICK, DROPDOWN_CLOSE } from '../utils';


export default class Dropdown extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.state = {
      open: false,
    };
  }

  emitEvent(type, action, item) {
    if (this.props.analytics && this.props.analytics.title) {
      EmitEvent(type, 'dropdown', action, this.props.analytics.title, item);
    }
  }

  open() {
    if (typeof this.props.onOpen === 'function') {
      this.props.onOpen();
    }

    this.emitEvent(DROPDOWN_OPEN, 'open');

    this.setState({ open: !this.state.open });
  }

  close() {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }

    this.emitEvent(DROPDOWN_CLOSE, 'close');

    this.setState({ open: false });
  }

  wrapClick(f, item) {
    return (...args) => {
      if (f !== this.open) {
        this.emitEvent(DROPDOWN_CLICK, 'change', item);
        f(...args);
      }
    };
  }

  render() {
    const [{ elements: [first] }, ...groups] = this.props.groups;
    const { disabled, dropdownIcon } = this.props;

    const dropdownMenu = groups.map((group, i) => (
      <div className="Dropdown-group" key={group.name || i}>
        {!group.name ? null : (
          <div className="Dropdown-groupLabel">{group.name}</div>
        )}
        <div className="Dropdown-elements">
          {group.elements.map((item) => (
            <button
              type="button"
              key={item.name}
              id={(item || '').name.split(' ').join('-').toLowerCase()}
              className="Dropdown-item"
              // This onMouseDown is intentional. See https://github.com/linode/manager/pull/223
              onMouseDown={this.wrapClick(item.action, item.name)}
            >{item.name}</button>
          ))}
        </div>
      </div>
    ));

    const orientation = !this.props.leftOriented ? 'Dropdown-menu--right' : '';

    return (
      <div
        className={`Dropdown btn-group ${this.state.open ? 'Dropdown--open' : ''}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="Dropdown-first"
          onClick={this.wrapClick(first.action || this.open)}
          disabled={disabled}
          id={(first.name || '').split(' ').join('-').toLowerCase()}
        >{first.name}</button>
        {groups.length === 0 ? null : (
          <button
            disabled={disabled}
            type="button"
            className="Dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={this.state.open}
            onClick={this.open}
          ><i className={`fa ${dropdownIcon}`} /></button>
        )}
        <div className={`Dropdown-menu ${orientation}`}>{dropdownMenu}</div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node,
    elements: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.node.isRequired,
      action: PropTypes.func,
    })),
  })).isRequired,
  leftOriented: PropTypes.bool,
  disabled: PropTypes.bool,
  dropdownIcon: PropTypes.string,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  analytics: PropTypes.shape({
    title: PropTypes.string,
  }),
};

Dropdown.defaultProps = {
  dropdownIcon: 'fa-caret-down',
  analytics: {},
};
