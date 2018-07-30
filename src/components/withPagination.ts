import withStateHandlers from 'recompose/withStateHandlers';

type StateUpdater = (update: (state: State) => State, callback?: Function) => void;

export interface PaginationProps {
  count: number;
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  page: number;
  pageSize: number;

  setPagination: StateUpdater;
}

interface State {
  count: number;
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  page: number;
  pageSize: number;
}

const initialState: State = {
  count: 0,
  errors: undefined,
  loading: false,
  page: 1,
  pageSize: 25,
};

const handlers = {
  setPagination: (state: State) => (update: (state: State) => State) => update(state),
};

const withPagination = withStateHandlers(initialState, handlers);

export default withPagination;
