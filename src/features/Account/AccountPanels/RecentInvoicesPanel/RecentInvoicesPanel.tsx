import * as moment from 'moment-timezone';
import { compose, map, pathOr, sort } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter from 'src/components/PaginationFooter';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import withPagination, { PaginationProps } from 'src/components/withPagination';

import { getInvoices } from 'src/services/account';

interface InvoiceWithDate extends Linode.Invoice { moment: moment.Moment };

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State {
  data?: InvoiceWithDate[],
}

type CombinedProps = Props & PaginationProps & WithStyles<ClassNames>;

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  mounted: boolean = false;

  addToItems: (incoming: Linode.Invoice[]) => InvoiceWithDate[] =
    compose(

      /** Sort in descending/revers chronological order. */
      sort((a, b) => b.moment.diff(a.moment)),

      /**
       * Add the moment reference for sorting.
       * Add the displayDate now since we already have the reference.
       */
      map<Linode.Invoice, InvoiceWithDate>((item) => {
        const m = moment(item.date);
        return {
          ...item,
          moment: m,
        };
      }),
    );

  requestInvoices = (
    page: number = this.props.page,
    pageSize: number = this.props.pageSize,
  ) => {
    if (!this.mounted) { return; }
    this.props.setPagination((prevState) => ({
      ...prevState,
      loading: this.state.data === undefined,
      errors: undefined,
    }));

    return getInvoices({ page, page_size: pageSize })
      .then(({ data, page, pages, results }) => {
        if (!this.mounted) { return; }

        this.setState({ data: this.addToItems(data) });

        this.props.setPagination((prevState) => ({
          ...prevState,
          page,
          count: results,
          loading: false,
        }));
      })
      .catch((response) => {
        if (!this.mounted) { return; }

        const fallbackError = [{ reason: 'Unable to retrieve invoices.' }];
        this.props.setPagination((prevState) => ({
          ...prevState,
          loading: false,
          errors: pathOr(fallbackError, ['response', 'data', 'errors'], response)
        }));
      });
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { data } = this.state;
    const { count, page, pageSize } = this.props;

    return (
      <ExpansionPanel
        heading="Recent Invoices"
        onChange={this.handleExpansion}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderContent()}
          </TableBody>
        </Table>
        {data && data.length > 0 &&
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.handlePageChange}
            handleSizeChange={this.handlePageSizeChange}
          />
        }
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const { data } = this.state;
    const { loading, errors } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={3} />
    }

    if (errors) {
      return <TableRowError colSpan={3} message="We were unable to load your invoices." />
    }

    return data && data.length > 0 ? this.renderItems(data) : <TableRowEmptyState colSpan={3} />
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.requestInvoices();
    }
  };

  renderItems = (items: InvoiceWithDate[]) => items.map(this.renderRow);

  renderRow = (item: InvoiceWithDate) => {
    return (
      <TableRow key={`invoice-${item.id}`}>
        <TableCell><DateTimeDisplay value={item.date} /></TableCell>
        <TableCell><Link to="">Invoice #{item.id}</Link></TableCell>
        <TableCell>${item.total}</TableCell>
      </TableRow>
    );
  };

  handlePageChange = (page: number) => {
    this.requestInvoices(page, this.props.pageSize);
    this.props.setPagination((prevState) => ({ ...prevState, page }));
  };

  handlePageSizeChange = (pageSize: number) => {
    if (!this.mounted) { return; }
    this.requestInvoices(this.props.page, pageSize);
    this.props.setPagination((prevState) => ({ ...prevState, pageSize }));
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(
  withPagination,
  styled,
);

export default enhanced(RecentInvoicesPanel);

