import React, { Component, PropTypes } from 'react';

import PasswordInput from '~/components/PasswordInput';

export default class Details extends Component {
  constructor() {
    super();
    this.renderRow = this.renderRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      password: '',
      group: '',
      label: '',
      enableBackups: false,
      showAdvanced: false,
    };
  }

  onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onSubmit({
      password: this.state.password,
      label: this.state.label,
      group: this.state.group,
      backups: this.state.enableBackups,
    });
  }

  renderRow({ label, errors, children, showIf = true }) {
    if (!showIf) {
      return null;
    }

    return (
      <div className="form-group row">
        <div className="col-sm-2 label-col">{label ? `${label}:` : null}</div>
        <div className="col-sm-10 content-col">
          {children}
          {!errors ? null : (
            <div className="alert alert-danger">
              <ul>
                {errors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
           )}
        </div>
      </div>
    );
  }

  render() {
    const { errors, selectedType, selectedDistribution, submitEnabled } = this.props;

    const renderBackupsPrice = () => {
      const price = (selectedType.backups_price / 100).toFixed(2);
      return `($${price}/mo)`;
    };

    const showAdvancedOrHide = this.state.showAdvanced ? (
      <span>Hide additional details <span className="fa fa-angle-up" /></span>
    ) : (
      <span>Show additional details <span className="fa fa-angle-down" /></span>
    );

    const formDisabled = !(submitEnabled && this.state.label &&
                           (this.state.password || selectedDistribution === 'none'));

    return (
      <div className="LinodesCreateDetails">
        <header className="LinodesCreateDetails-header">
          <h2 className="LinodesCreateDetails-title">Details</h2>
        </header>
        <div className="LinodesCreateDetails-body">
          <form onSubmit={this.onSubmit}>
            <section>
              <this.renderRow label="Label" errors={errors.label}>
                <div className="LinodesCreateDetails-label">
                  <input
                    value={this.state.label}
                    onChange={e => this.setState({ label: e.target.value })}
                    placeholder={'gentoo-www1'}
                    className="form-control"
                  />
                </div>
              </this.renderRow>
              <this.renderRow
                label="Root password"
                errors={errors.root_password}
                showIf={selectedDistribution !== 'none'}
              >
                <div className="LinodesCreateDetails-password">
                  <PasswordInput
                    passwordType="offline_fast_hashing_1e10_per_second"
                    onChange={password => this.setState({ password })}
                  />
                </div>
              </this.renderRow>
              <this.renderRow
                label="Enable backups"
                errors={errors.backups}
                showIf={selectedDistribution !== 'none'}
              >
                <div className="LinodesCreateDetails-enableBackups">
                  <label>
                    <input
                      type="checkbox"
                      checked={this.state.enableBackups}
                      onChange={e => this.setState({ enableBackups: e.target.checked })}
                      disabled={selectedType === null}
                    />
                    <span>
                      {selectedType === null ? '' : renderBackupsPrice()}
                    </span>
                  </label>
                </div>
              </this.renderRow>
              <button
                type="button"
                className="LinodesCreateDetails-toggleAdvanced"
                onClick={() => this.setState({ showAdvanced: !this.state.showAdvanced })}
              >{showAdvancedOrHide}</button>
              <this.renderRow
                label="Group"
                showIf={this.state.showAdvanced && selectedDistribution !== 'none'}
              >
                <div className="LinodesCreateDetails-group">
                  <input
                    value={this.state.group}
                    onChange={e => this.setState({ group: e.target.value })}
                    placeholder="my-group"
                    className="form-control"
                    name="group"
                  />
                </div>
              </this.renderRow>
            </section>
            <section>
              <button
                disabled={formDisabled}
                className="LinodesCreateDetails-create"
              >Create Linode{this.state.quantity > 1 ? 's' : null}</button>
            </section>
          </form>
        </div>
      </div>
    );
  }
}

Details.propTypes = {
  selectedType: PropTypes.object,
  selectedDistribution: PropTypes.string,
  onSubmit: PropTypes.func,
  submitEnabled: PropTypes.bool,
  errors: PropTypes.object,
};

Details.defaultProps = {
  errors: {},
};
