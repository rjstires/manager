import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { groupByTags, GroupedBy, NONE } from 'src/utilities/groupByTags';
import CardView from './CardView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';

interface Props {
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
  view: undefined | 'grid' | 'list';
}

interface WithLinodes {
  linodesData: Linode.Linode[];
  linodesCount: number;
}

type CombinedProps =
  & Props
  & WithLinodes;

const DisplayGroupedLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const { view, linodesData, ...rest } = props;

  if (props.linodesCount === 0) {
    return <ListLinodesEmptyState />
  }

  const groupedLinodes = compose(
    sortGroupedLinodes,
    groupByTags,
  )(linodesData);

  const Component = view
    ? view === 'grid'
      ? CardView
      : ListView
    : props.linodesCount >= 3
      ? ListView
      : CardView;

  return (
    <React.Fragment>
      {groupedLinodes.map(([tag, linodes]) => {
        return (
          <React.Fragment key={tag}>
            <Typography variant="h1">{tag}</Typography>
            <Paginate data={linodes} pageSize={25}>
              {(paginatedProps) => (
                <React.Fragment>
                  <Hidden mdUp>
                    <CardView {...rest} {...paginatedProps} />
                  </Hidden>
                  <Hidden smDown>
                    <Component {...rest} {...paginatedProps} />
                  </Hidden>
                  <Grid item xs={12}>
                    {
                      <PaginationFooter
                        count={paginatedProps.count}
                        handlePageChange={paginatedProps.handlePageChange}
                        handleSizeChange={paginatedProps.handlePageSizeChange}
                        pageSize={paginatedProps.pageSize}
                        page={paginatedProps.page}
                      />
                    }
                  </Grid>
                </React.Fragment>
              )}
            </Paginate>
          </React.Fragment>
        )
      })}
    </React.Fragment>
  );
};

const withLinodes = connect((state: ApplicationState, ownProps) => ({
  linodesData: state.__resources.linodes.entities,
  linodesCount: state.__resources.linodes.results.length,
}));

export default withLinodes(DisplayGroupedLinodes);

/**
 * Moves the NONE to the top, and alphabetically sorts the remainder.
 */
const sortGroupedLinodes = (groups: GroupedBy<Linode.Linode>) => {
  let foundUntaggedIndex;
  let idx = 0;
  const len = groups.length;
  for (; idx < len; idx++) {
    const [tag] = groups[idx];
    if (tag === NONE) {
      foundUntaggedIndex = idx;
      break;
    }
  }

  if (typeof foundUntaggedIndex === 'undefined') {
    return groups;
  }

  return [
    groups[foundUntaggedIndex],
    ...groups
      .filter(([tag]) => tag !== NONE)
      .sort(([a], [b]) => a > b ? 0 : -1),
  ];
}