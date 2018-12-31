import { compose, take } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import volumesContainer, { Props as WithVolumesProps } from 'src/containers/volumes.container';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  labelCol: {
    width: '60%',
  },
  moreCol: {
    width: '30%',
  },
  actionsCol: {
    width: '10%',
  },
  wrapHeader: {
    wordBreak: 'break-all',
  },
});


type CombinedProps = WithVolumesProps & WithStyles<ClassNames>;

class VolumesDashboardCard extends React.PureComponent<CombinedProps> {
  render() {
    return (
      <DashboardCard title="Volumes" headerAction={this.renderAction} data-qa-dash-volume>
        <Paper>
          <Table>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  renderAction = () => this.props.volumesData.length > 5
    ? <Link to={'/volumes'}>View All</Link>
    : null;

  renderContent = () => {
    const { volumesData, volumesError, volumesLoading } = this.props;
    if (volumesLoading) {
      return this.renderLoading();
    }

    if (volumesError) {
      return this.renderErrors(volumesError);
    }

    if (volumesData.length > 0) {
      return this.renderData(volumesData);
    }

    return this.renderEmpty();
  }

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />
  };

  renderErrors = (errors: Error) =>
    <TableRowError colSpan={3} message={`Unable to load Volumes.`} />;

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  renderData = (data: Linode.Volume[]) => {
    const { classes } = this.props;
    return (
      <OrderBy data={data} order={'desc'} orderBy={'label'}>
        {({ data: orderedData }) => (
          <>
            {
              take(5, orderedData)
                .map(({ label, region, size, status }) => (
                  <TableRow key={label} data-qa-volume={label}>
                    <TableCell className={classes.labelCol}>
                      <Grid container direction="column" spacing={8}>
                        <Grid item style={{ paddingBottom: 0 }}>
                          <Typography className={classes.wrapHeader} variant="h3">
                            {label}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="body1" data-qa-volume-status>
                            {status}, {size} GiB
                        </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <Hidden xsDown>
                      <TableCell className={classes.moreCol} data-qa-volume-region>
                        <RegionIndicator region={region} />
                      </TableCell>
                    </Hidden>
                  </TableRow>
                ))
            }
          </>
        )}
      </OrderBy>
    )
  };
}

const styled = withStyles(styles);

const enhanced = compose(
  styled,
  volumesContainer(),
);

export default enhanced(VolumesDashboardCard) as React.ComponentType<{}>;
