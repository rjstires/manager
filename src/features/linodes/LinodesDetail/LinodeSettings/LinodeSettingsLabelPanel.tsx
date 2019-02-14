import { compose, lensPath, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface State {
  initialValue: string;
  updatedValue: string;
  submitting: boolean;
  success?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = LinodeDetailContext & WithStyles<ClassNames>;

class LinodeSettingsLabelPanel extends React.Component<CombinedProps, State> {
  state: State = {
    initialValue: this.props.linode.label,
    updatedValue: this.props.linode.label,
    submitting: false
  };

  changeLabel = () => {
    const { updateLinode } = this.props;
    this.setState(set(lensPath(['submitting']), true));
    this.setState(set(lensPath(['success']), undefined));
    this.setState(set(lensPath(['errors']), undefined));

    updateLinode({ label: this.state.updatedValue })
      .then(linode => {
        this.setState(
          compose(
            set(lensPath(['success']), `Linode label changed successfully.`),
            set(lensPath(['submitting']), false)
          )
        );
      })
      .catch(error => {
        this.setState(
          set(lensPath(['errors']), error.response.data.errors),
          () => {
            scrollErrorIntoView('linode-settings-label');
          }
        );
      });
  };

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const labelError = hasErrorFor('label');
    const { submitting } = this.state;

    return (
      <ExpansionPanel
        heading="Linode Label"
        success={this.state.success}
        actions={() => (
          <ActionsPanel>
            <Button
              onClick={this.changeLabel}
              type="primary"
              disabled={submitting && !labelError}
              loading={submitting && !labelError}
              data-qa-label-save
            >
              Save
            </Button>
          </ActionsPanel>
        )}
      >
        <TextField
          label="Label"
          value={this.state.updatedValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            this.setState(set(lensPath(['updatedValue']), e.target.value))
          }
          errorText={labelError}
          errorGroup="linode-settings-label"
          error={Boolean(labelError)}
          data-qa-label
        />
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles);

const errorBoundary = PanelErrorBoundary({ heading: 'Linode Label' });

const linodeContext = withLinodeDetailContext(context => context);

export default compose(
  errorBoundary,
  styled,
  linodeContext
)(LinodeSettingsLabelPanel) as React.ComponentType<{}>;
