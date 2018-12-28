import { compose, path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import withImages from 'src/containers/withImages.container';
import { StackScripts } from 'src/documentation';
import ScriptForm from 'src/features/StackScripts/StackScriptForm';
import { createStackScript } from 'src/services/stackscripts';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  createTitle: {
    lineHeight: '2.25em'
  },
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
    marginBottom: 20,
    alignItems: 'center',
    wordBreak: 'break-all',
  },
});

interface State {
  labelText: string;
  descriptionText: string;
  imageSelectOpen: boolean;
  selectedImages: string[];
  script: string;
  revisionNote: string;
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
  dialogOpen: boolean;
}

type CombinedProps = StateProps
  & WithImagesProps
  & SetDocsProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>;

const errorResources = {
  label: 'A label',
  images: 'Images',
  script: 'A script'
};

export class StackScriptCreate extends React.Component<CombinedProps, State> {
  state: State = {
    labelText: '',
    descriptionText: '',
    imageSelectOpen: false,
    selectedImages: [],
    /* available images to select from in the dropdown */
    script: '',
    revisionNote: '',
    isSubmitting: false,
    dialogOpen: false,
  };

  static docs = [
    StackScripts,
  ];

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ labelText: e.target.value });
  }

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ descriptionText: e.target.value });
  }

  handleOpenSelect = () => {
    this.setState({ imageSelectOpen: true });
  }

  handleCloseSelect = () => {
    this.setState({ imageSelectOpen: false });
  }

  handleRemoveImage = (id: string) => {
    const { selectedImages } = this.state;
    this.setState({
      selectedImages: selectedImages.filter((imageId) => imageId !== id),
    });
  }

  handleChooseImage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      selectedImages: [...this.state.selectedImages, e.target.value],
    })
    this.setState({ imageSelectOpen: true });
  }

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value });
  }

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ revisionNote: e.target.value });
  }

  resetAllFields = () => {
    this.handleCloseDialog();
    this.setState({
      script: '',
      labelText: '',
      selectedImages: [],
      descriptionText: '',
      revisionNote: '',
    })
  }

  handleCreateStackScript = () => {
    const { script, labelText, selectedImages, descriptionText, revisionNote } = this.state;

    const { history } = this.props;

    const payload = {
      script,
      label: labelText,
      images: selectedImages,
      description: descriptionText,
      is_public: false,
      rev_note: revisionNote,
    }

    if (!this.mounted) { return; }
    this.setState({ isSubmitting: true });

    createStackScript(payload)
      .then((stackScript: Linode.StackScript.Response) => {
        if (!this.mounted) { return; }
        this.setState({ isSubmitting: false });
        history.push(
          '/stackscripts',
          { successMessage: `${stackScript.label} successfully created` }
        );
      })
      .catch(error => {
        if (!this.mounted) { return; }

        this.setState(() => ({
          isSubmitting: false,
          errors: error.response && error.response.data && error.response.data.errors,
        }), () => {
          scrollErrorIntoView();
        });
      })
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true })
  }

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false })
  }

  renderDialogActions = () => {
    return (
      <ActionsPanel>
        <Button
          type="cancel"
          onClick={this.handleCloseDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          onClick={this.resetAllFields}
          data-qa-confirm-cancel
        >
          Reset
        </Button>
      </ActionsPanel>
    )
  }

  renderCancelStackScriptDialog = () => {
    const { dialogOpen } = this.state;

    return (
      <ConfirmationDialog
        title={`Clear StackScript Configuration?`}
        open={dialogOpen}
        actions={this.renderDialogActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>Are you sure you want to reset your StackScript configuration?</Typography>
      </ConfirmationDialog>
    )
  }

  render() {
    const { classes, username } = this.props;
    const {
      selectedImages,
      script,
      labelText,
      descriptionText,
      revisionNote,
      errors,
      isSubmitting,
    } = this.state;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const availableImages = this.props.imagesData.filter((image) =>
      !this.state.selectedImages.includes(image.id))

    if (!username) {
      return <ErrorState errorText="An error has occurred. Please try again." />
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create New StackScript" />
        {generalError &&
          <Notice error text={generalError} />
        }
        <Grid
          container
          justify="space-between"
        >
          <Grid item className={classes.titleWrapper}>
            <Breadcrumb
              linkTo="/stackscripts"
              linkText="StackScripts"
              labelTitle="Create New StackScript"
              data-qa-create-stackscript-breadcrumb
            />
          </Grid>
        </Grid>
        <ScriptForm
          currentUser={username}
          images={{
            available: availableImages,
            selected: selectedImages,
            handleRemove: this.handleRemoveImage
          }}
          label={{
            value: labelText,
            handler: this.handleLabelChange
          }}
          description={{
            value: descriptionText,
            handler: this.handleDescriptionChange
          }}
          revision={{
            value: revisionNote,
            handler: this.handleChangeRevisionNote
          }}
          script={{
            value: script,
            handler: this.handleChangeScript
          }}
          selectImages={{
            open: this.state.imageSelectOpen, // idk
            onOpen: this.handleOpenSelect,
            onClose: this.handleCloseSelect,
            onChange: this.handleChooseImage
          }}
          errors={errors}
          onSubmit={this.handleCreateStackScript}
          onCancel={this.handleOpenDialog}
          isSubmitting={isSubmitting}
        />
        {this.renderCancelStackScriptDialog()}
      </React.Fragment>
    );
  }
}

interface StateProps {
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => ({
  username: path(['data', 'username'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

interface WithImagesProps {
  imagesData: Linode.Image[]
  imagesLoading: boolean;
  imagesError?: Linode.ApiFieldError[];
}

export default compose(
  setDocs(StackScriptCreate.docs),
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true),
    imagesLoading,
    imagesError
  })),
  styled,
  withRouter,
  connected,
)(StackScriptCreate)
