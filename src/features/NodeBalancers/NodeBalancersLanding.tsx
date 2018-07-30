import * as Promise from 'bluebird';
import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import NodeBalancer from 'src/assets/addnewmenu/nodebalancer.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Table from 'src/components/Table';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import withPagination, { PaginationProps } from 'src/components/withPagination';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { deleteNodeBalancer, getNodeBalancerConfigs, getNodeBalancers } from 'src/services/nodebalancers';
import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import scrollToTop from 'src/utilities/scrollToTop';

import NodeBalancerActionMenu from './NodeBalancerActionMenu';

type ClassNames = 'root' | 'title' | 'NBStatus';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  NBStatus: {
    whiteSpace: 'nowrap',
  }
});

interface Props { }

interface DeleteConfirmDialogState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State {
  deleteConfirmDialog: DeleteConfirmDialogState;
  nodeBalancers?: Linode.ExtendedNodeBalancer[];
  selectedNodeBalancerId?: number;
}

type CombinedProps = Props
  & PaginationProps
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & SetDocsProps;

export class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
  };

  state: State = {
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
  };

  static docs = [
    {
      title: 'Getting Started with NodeBalancers',
      src: 'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/',
      body: `Using a NodeBalancer to begin managing a simple web application`,
    },
    {
      title: 'NodeBalancer Reference Guide',
      src: 'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide/',
      body: `NodeBalancer Reference Guide`,
    },
  ];

  componentDidMount() {
    this.mounted = true;
    this.requestNodeBalancers(undefined, undefined);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  requestNodeBalancers = (
    page: number = this.props.page,
    pageSize: number = this.props.pageSize,
  ) => {
    this.props.setPagination((prevState) => ({
      ...prevState,
      loading: this.state.nodeBalancers === undefined,
    }));
    // this is pretty tricky. we need to make a call to get the configs for each nodebalancer
    // because the up and down time data lives in the configs along with the ports
    //
    // after we get that data, we have to add each config's up time together
    // and each down time together
    return getNodeBalancers({ page, page_size: pageSize })
      .then((response) => {
        return new Promise((resolve, reject) => {
          Promise.map(response.data, (nodeBalancer) => getNodeBalancerConfigs(nodeBalancer.id)
            .then(({ data: configs }) => ({
              ...nodeBalancer,
              // add the downtime for each config together
              down: configs.reduce((acc: number, config) => acc + config.nodes_status.down, 0),
              // add the uptime for each config together
              up: configs.reduce((acc: number, config) => acc + config.nodes_status.up, 0),
              // generate a list of ports.
              ports: configs.reduce((acc: [number], config) => [...acc, config.port], []),
            })))
            .then((data) => resolve({ ...response, data }))
            .catch((error) => reject(error));
        });
      })
      .then(({ results, page, data }: Linode.ResourcePage<Linode.ExtendedNodeBalancer>) => {
        if (!this.mounted) { return; }

        this.setState({ nodeBalancers: data });

        this.props.setPagination((prevState) => ({
          ...prevState,
          count: results,
          page,
          loading: false,
        }));
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.props.setPagination((prevState) => ({
          ...prevState,
          loading: false,
          errors: pathOr([{ reason: 'Unable to load NodeBalancer data.' }], ['response', 'data', 'errors'], error),
        }));
      });
  };

  handlePageChange = (page: number) => {
    this.requestNodeBalancers(page, this.props.pageSize);
    this.props.setPagination((prevState) => ({ ...prevState, page }));
    scrollToTop();
  }

  handlePageSizeChange = (pageSize: number) => {
    this.requestNodeBalancers(this.props.page, pageSize);
    this.props.setPagination((prevState) => ({ ...prevState, pageSize }));
    scrollToTop();
  }

  toggleDialog = (nodeBalancerId: number) => {
    this.setState({
      selectedNodeBalancerId: nodeBalancerId,
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        open: !this.state.deleteConfirmDialog.open,
      },
    });
  }

  deleteNodeBalancer = () => {
    const { selectedNodeBalancerId } = this.state;
    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancer(selectedNodeBalancerId!)
      .then((response) => {
        const { nodeBalancers } = this.state;
        if (!nodeBalancers) { return; }

        this.setState({
          nodeBalancers: nodeBalancers.filter((nodebalancer) => nodebalancer.id === selectedNodeBalancerId),
          deleteConfirmDialog: {
            open: false,
            submitting: false,
          },
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfirmDialog: {
            ...this.state.deleteConfirmDialog,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  render() {
    const { classes, history } = this.props;

    const {
      deleteConfirmDialog: {
        open: deleteConfirmAlertOpen,
      },
    } = this.state;
    const { count, loading, page, pageSize } = this.props;

    if (!loading && count === 0) {
      return this.renderEmpty()
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography variant="headline" className={classes.title} data-qa-title >
              NodeBalancers
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={() => history.push('/nodebalancers/create')}
                  label="Add a NodeBalancer"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Node Status</TableCell>
                <TableCell>Transferred</TableCell>
                <TableCell>Ports</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={count}
          page={page}
          pageSize={pageSize}
          handlePageChange={this.handlePageChange}
          handleSizeChange={this.handlePageSizeChange}
        />
        <ConfirmationDialog
          onClose={() => this.setState({
            deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
          })}
          title="Confirm Deletion"
          error={(this.state.deleteConfirmDialog.errors || []).map(e => e.reason).join(',')}
          actions={({ onClose }) =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                data-qa-confirm-cancel
                onClick={this.deleteNodeBalancer}
                type="secondary"
                destructive
                loading={this.state.deleteConfirmDialog.submitting}
              >
                Delete
              </Button>
              <Button
                onClick={() => onClose()}
                type="cancel"
                data-qa-cancel-cancel
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={deleteConfirmAlertOpen}
        >
          <Typography>Are you sure you want to delete your NodeBalancer</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderContent = () => {
    const { nodeBalancers } = this.state;
    const { count, errors, loading } = this.props;

    if (loading) {
      return this.renderLoading();
    }

    if (errors) {
      return this.renderErrors(errors);
    }

    if (nodeBalancers && count > 0) {
      return this.renderData(nodeBalancers);
    }

    return null;
  };

  renderLoading = () => <TableRowLoading colSpan={7} />;

  renderErrors = (errors: Linode.ApiFieldError[]) => {
    return <TableRowError message="There was an error loading your NodeBalancers. Please try again later." colSpan={7} />;
  };

  renderEmpty = () => {
    return (
      <Placeholder
        title="Add a NodeBalancer"
        copy="Adding a NodeBalancer is easy. Click below to add a NodeBalancer."
        icon={NodeBalancer}
        buttonProps={{
          onClick: () => this.props.history.push('/nodebalancers/create'),
          children: 'Add a NodeBalancer',
        }}
      />
    );
  };

  renderData = (nodeBalancers: Linode.ExtendedNodeBalancer[]) => {
    const { classes } = this.props;

    return nodeBalancers.map((nodeBalancer) => {
      return (
        <TableRow key={nodeBalancer.id} data-qa-nodebalancer-cell>
          <TableCell data-qa-nodebalancer-label>
            <Link to={`/nodebalancers/${nodeBalancer.id}`}>
              {nodeBalancer.label}
            </Link>
          </TableCell>
          <TableCell data-qa-node-status>
            <span className={classes.NBStatus}>{nodeBalancer.up} up</span> <br />
            <span className={classes.NBStatus}>{nodeBalancer.down} down</span>
          </TableCell>
          <TableCell data-qa-transferred>
            {convertMegabytesTo(nodeBalancer.transfer.total)}
          </TableCell>
          <TableCell data-qa-ports>
            {nodeBalancer.ports.length === 0 && 'None'}
            {nodeBalancer.ports.join(', ')}
          </TableCell>
          <TableCell data-qa-nodebalancer-ips>
            <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
            {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
          </TableCell>
          <TableCell data-qa-region>
            <RegionIndicator region={nodeBalancer.region} />
          </TableCell>
          <TableCell>
            <NodeBalancerActionMenu
              nodeBalancerId={nodeBalancer.id}
              toggleDialog={this.toggleDialog}
            />
          </TableCell>
        </TableRow>
      );
    })
  }
};

const styled = withStyles(styles, { withTheme: true });

export const enhanced = compose(
  withPagination,
  styled,
  withRouter,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);
