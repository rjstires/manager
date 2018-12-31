import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { createSelector, createStructuredSelector } from 'reselect';
import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowError from 'src/components/TableRowError';
import Tags from 'src/components/Tags';
import { BlockStorage } from 'src/documentation';
import { resetEventsPolling } from 'src/events';
import { deleteVolume, detachVolume } from 'src/services/volumes';
import { orm } from 'src/store/orm';
import { openForClone, openForConfig, openForCreating, openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';
import { formatRegion } from 'src/utilities';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import VolumesActionMenu from './VolumesActionMenu';

type ClassNames = 'root'
  | 'title'
  | 'labelCol'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol'
  | 'volumesWrapper'
  | 'linodeVolumesWrapper';

type TagClassNames = 'tagWrapper';


const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  // styles for /volumes table
  volumesWrapper: {
  },
  // styles for linodes/id/volumes table
  linodeVolumesWrapper: {
    '& $labelCol': {
      width: '20%',
      minWidth: 200,
    },
    '& $sizeCol': {
      width: '15%',
      minWidth: 100,
    },
    '& $pathCol': {
      width: '55%',
      minWidth: 350,
    },
  },
  labelCol: {
    width: '15%',
    minWidth: 150,
  },
  attachmentCol: {
    width: '15%',
    minWidth: 150,
  },
  sizeCol: {
    width: '10%',
    minWidth: 75,
  },
  pathCol: {
    width: '25%',
    minWidth: 250,
  },
});

const tagStyles: StyleRulesCallback<TagClassNames> = (theme) => ({
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer',
    },
  },
});

interface ExtendedVolume extends Linode.Volume {
  linodeLabel: string;
  linodeStatus: string;
}

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Linode.Config[];
  recentEvent?: Linode.Event;
}

interface DispatchProps {
  openForEdit: (volumeId: number, volumeLabel: string, volumeTags: string[]) => void;
  openForResize: (volumeId: number, volumeSize: number, volumeLabel: string) => void;
  openForClone: (volumeId: number, volumeLabel: string, volumeSize: number, volumeRegion: string) => void;
  openForCreating: (linodeId?: number, linodeLabel?: string, linodeRegion?: string) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
}

interface State {
  attachmentDrawer: {
    open: boolean;
    volumeID?: number;
    volumeLabel?: string;
    linodeRegion?: string;
  };
  destructiveDialog: {
    open: boolean;
    mode: 'detach' | 'delete';
    volumeID?: number;
  };
}

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps =
  & WithVolumesProps
  & Props
  & DispatchProps
  & RouteProps
  & InjectedNotistackProps
  & WithStyles<ClassNames>;

interface TagProps {
  tags: string[];
}

type CombinedTagsProps = TagProps & WithStyles<TagClassNames>;

class RenderTagsBase extends React.Component<CombinedTagsProps, {}> {
  render() {
    const { classes, tags } = this.props;
    return (
      <div className={classes.tagWrapper}>
        <Tags tags={tags} />
      </div>
    )
  }
}

const RenderTags = withStyles(tagStyles)(RenderTagsBase);

class VolumesLanding extends React.Component<CombinedProps, State> {
  state: State = {
    attachmentDrawer: {
      open: false,
    },
    destructiveDialog: {
      open: false,
      mode: 'detach',
    },
  };

  static docs: Linode.Doc[] = [
    BlockStorage,
    {
      title: 'Boot a Linode from a Block Storage Volume',
      src: `https://www.linode.com/docs/platform/block-storage/boot-from-block-storage-volume/`,
      body: `This guide shows how to boot a Linode from a Block Storage Volume.`,
    },
  ];

  handleCloseAttachDrawer = () => {
    this.setState({ attachmentDrawer: { open: false } });
  }

  handleAttach = (volumeID: number, label: string, regionID: string) => {
    this.setState({
      attachmentDrawer: {
        open: true,
        volumeID,
        volumeLabel: label,
        linodeRegion: regionID,
      }
    })
  }

  handleDetach = (volumeID: number) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'detach',
        volumeID,
      }
    })
  }

  handleDelete = (volumeID: number) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'delete',
        volumeID,
      }
    })
  }

  render() {
    const { classes, volumesData, volumesLoading, volumesError } = this.props;

    if (volumesLoading) {
      return this.renderLoading();
    }

    if (volumesData.length === 0) {
      return this.renderEmpty();
    }

    const isVolumesLanding = this.props.match.params.linodeId === undefined;

    return (
      <OrderBy data={volumesData} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData}>
              {({ count, data: paginatedData, handlePageChange, handlePageSizeChange, page, pageSize }) => {
                return (
                  <React.Fragment>
                    <DocumentTitleSegment segment="Volumes" />
                    <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
                      <Grid item>
                        <Typography role="header" variant="h1" className={classes.title} data-qa-title >
                          Volumes
                    </Typography>
                      </Grid>
                      <Grid item>
                        <Grid container alignItems="flex-end">
                          <Grid item>
                            <AddNewLink
                              onClick={this.openCreateVolumeDrawer}
                              label="Create a Volume"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Paper>
                      <Table aria-label="List of Volumes" className={isVolumesLanding ? classes.volumesWrapper : classes.linodeVolumesWrapper}>
                        <TableHead>
                          <TableRow>
                            <TableCell className={classes.labelCol}>Label</TableCell>
                            {isVolumesLanding && <TableCell>Region</TableCell>}
                            <TableCell className={classes.sizeCol}>Size</TableCell>
                            <TableCell className={classes.pathCol}>File System Path</TableCell>
                            {isVolumesLanding && <TableCell className={classes.attachmentCol}>Attached To</TableCell>}
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.renderContent(paginatedData, volumesError)}
                        </TableBody>
                      </Table>
                    </Paper>
                    <PaginationFooter
                      count={count}
                      page={page}
                      pageSize={pageSize}
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      eventCategory="volumes landing"
                    />
                    <VolumeAttachmentDrawer
                      open={this.state.attachmentDrawer.open}
                      volumeID={this.state.attachmentDrawer.volumeID || 0}
                      volumeLabel={this.state.attachmentDrawer.volumeLabel || ''}
                      linodeRegion={this.state.attachmentDrawer.linodeRegion || ''}
                      onClose={this.handleCloseAttachDrawer}
                    />
                    <DestructiveVolumeDialog
                      open={this.state.destructiveDialog.open}
                      mode={this.state.destructiveDialog.mode}
                      onClose={this.closeDestructiveDialog}
                      onDetach={this.detachVolume}
                      onDelete={this.deleteVolume}
                    />
                  </React.Fragment>
                );
              }}
            </Paginate>
          )
        }}
      </OrderBy>
    );
  }

  renderContent = (data: ExtendedVolume[], error?: Error) => {

    if (error) {
      return this.renderErrors(error);
    }


    if (data && data.length > 0) {
      return this.renderData(data);
    }

    return null;
  };

  renderLoading = () => {
    return <CircleProgress />;
  };

  renderErrors = (errors: Error) => {
    return (
      <TableRowError colSpan={5} message="There was an error loading your volumes." />
    );
  };

  gotToSettings = () => {
    const { history, linodeId } = this.props;
    history.push(`/linodes/${linodeId}/settings`);
  };

  renderEmpty = () => {
    const { linodeConfigs } = this.props;

    if (linodeConfigs && linodeConfigs.length === 0) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Volumes" />
          <Placeholder
            title="No configs available."
            copy="This Linode has no configurations. Click below to create a configuration."
            icon={VolumesIcon}
            buttonProps={{
              onClick: this.gotToSettings,
              children: 'View Linode Configurations',
            }}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Placeholder
          title="Create a Volume"
          copy="Add storage to your Linodes using the resilient Volumes service for $0.10/GiB per month."
          icon={VolumesIcon}
          buttonProps={{
            onClick: this.openCreateVolumeDrawer,
            children: 'Create a Volume',
          }}
        />
      </React.Fragment>
    );
  };

  renderData = (volumes: ExtendedVolume[]) => {
    const isVolumesLanding = this.props.match.params.linodeId === undefined;

    return volumes.map((volume) => {
      const label = pathOr('', ['label'], volume);
      const size = pathOr('', ['size'], volume);
      const filesystemPath = pathOr(
        /** @todo Remove path default when API releases filesystem_path. */
        `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
        ['filesystem_path'],
        volume,
      );
      const regionID = pathOr('', ['region'], volume);
      const region = formatRegion(regionID);

      return isVolumeUpdating(volume.recentEvent)
        ? (
          <TableRow key={volume.id} data-qa-volume-loading className="fade-in-table">
            <TableCell data-qa-volume-cell-label={label}>
              {label}
              <RenderTags tags={volume.tags} />
            </TableCell>
            <TableCell colSpan={5}>
              <LinearProgress value={progressFromEvent(volume.recentEvent)} />
            </TableCell>
          </TableRow>
        )
        : (
          <TableRow key={volume.id} data-qa-volume-cell={volume.id} className="fade-in-table">
            <TableCell parentColumn="Label" data-qa-volume-cell-label={volume.label}>
              {volume.label}
              <RenderTags tags={volume.tags} />
            </TableCell>
            {isVolumesLanding && <TableCell parentColumn="Region" data-qa-volume-region>{region}</TableCell>}
            <TableCell parentColumn="Size" data-qa-volume-size>{size} GiB</TableCell>
            <TableCell parentColumn="File System Path" data-qa-fs-path>{filesystemPath}</TableCell>
            {isVolumesLanding && <TableCell parentColumn="Attached To" data-qa-volume-cell-attachment={volume.linodeLabel}>
              {volume.linodeLabel &&
                <Link to={`/linodes/${volume.linode_id}`}>
                  {volume.linodeLabel}
                </Link>
              }</TableCell>}
            <TableCell>
              <VolumesActionMenu
                onShowConfig={this.props.openForConfig}
                filesystemPath={filesystemPath}
                linodeLabel={volume.linodeLabel}
                regionID={regionID}
                volumeID={volume.id}
                volumeTags={volume.tags}
                size={size}
                label={label}
                onEdit={this.props.openForEdit}
                onResize={this.props.openForResize}
                onClone={this.props.openForClone}
                attached={Boolean(volume.linode_id)}
                onAttach={this.handleAttach}
                onDetach={this.handleDetach}
                poweredOff={volume.linodeStatus === 'offline'}
              />
            </TableCell>
          </TableRow>
        );
    });
  };

  closeDestructiveDialog = () => {
    this.setState({
      destructiveDialog: {
        ...this.state.destructiveDialog,
        open: false,
      },
    });
  }

  openCreateVolumeDrawer = (e: any) => {
    const { linodeId, linodeLabel, linodeRegion } = this.props;
    if (linodeId && linodeLabel && linodeRegion) {
      return this.props.openForCreating(linodeId, linodeLabel, linodeRegion);
    }

    this.props.openForCreating();

    e.preventDefault();
  }

  detachVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    detachVolume(volumeID)
      .then((response) => {
        /* @todo: show a progress bar for volume detachment */
        this.props.enqueueSnackbar('Volume detachment started', {
          variant: 'info',
        });
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }

  deleteVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    deleteVolume(volumeID)
      .then((response) => {
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }
}

const isVolumeUpdating = (e?: Linode.Event) => {
  return e
    && ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action)
    && ['scheduled', 'started'].includes(e.status);
};

const progressFromEvent = (e?: Linode.Event) => {
  if (!e) { return undefined }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize, openForClone, openForCreating, openForConfig },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const documented = setDocs(VolumesLanding.docs);

/** The volume must have linodeLabel and linodeStatus if it has linodeId */
const styled = withStyles(styles);

interface WithVolumesProps {
  volumesData: Linode.Volume[];
  volumesLoading: boolean;
  volumesError?: Error;
}

const addLinodeDetailsToVolume = (linodes: Linode.Linode[]) => (volume: Linode.Volume) => {
  const { linode_id } = volume;
  if (!linode_id) { return volume };

  const linode = linodes.find((l) => l.id === linode_id);
  if (!linode) { return volume; }

  return {
    ...volume,
    linodeStatus: linode.status,
    linodeLabel: linode.label,
  };
};

const volumesDataSelector = (linodeId?: number) => createSelector(
  (state: ApplicationState) => state.orm,
  (state: ApplicationState) => state.__resources.linodes.entities,
  (database, linodes) => {
    const session = orm.session(database);
    const volumes = session.volume.all();

    const set = linodeId
      ? volumes.filter({ linode_id: Number(linodeId) })
      : volumes;

    return set.toRefArray().map(addLinodeDetailsToVolume(linodes))
  }
);

const mapStateToProps = createStructuredSelector({
  volumesData: (state: ApplicationState, ownProps: RouteProps) => {
    const linodeId = path<number>(['match', 'params', 'linodeId'], ownProps);
    return volumesDataSelector(linodeId)(state);
  },
  volumesLoading: (state: ApplicationState) => state.requests.volume.read.loading,
  volumesError: (state: ApplicationState) => state.requests.volume.read.loading,
});

const withVolumes = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  connected,
  documented,
  withVolumes,
  styled,
  withSnackbar
)(VolumesLanding);
