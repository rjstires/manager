import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { omit, path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
  branch,
  compose,
  lifecycle,
  mapProps,
  renderComponent,
  withProps
} from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { getLinodeConfigs } from 'src/services/linodes';
import { ApplicationState } from 'src/store';
import { LinodeConsumer, LinodeProvider } from './linodeContext';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface RouteParams {
  linodeId: string;
}

type RouteProps = RouteComponentProps<RouteParams>;

class LinodeDetail extends React.PureComponent<{ linode: ExtendedLinode }> {
  render() {
    const { linode } = this.props;
    const context = {
      linode
    };

    console.log(this.props);

    return (
      <LinodeProvider value={context}>
        <LinodeConsumer>
          {({ linode }) => <pre>{JSON.stringify(linode, null, 2)}</pre>}
        </LinodeConsumer>
      </LinodeProvider>
    );
  }
}

const styled = withStyles(styles);

/**
 * CONFIGS
 */
interface ConfigsState {
  configsLoading: boolean;
  configsError?: Linode.ApiFieldError[];
  configs?: Linode.Config[];
}

const withConfigs = lifecycle({
  componentDidMount() {
    const boundGetConfigsForLinode = getConfigsForLinode.bind(this);
    boundGetConfigsForLinode();
  },
  componentDidUpdate(prevProps) {
    const boundGetConfigsForLinode = getConfigsForLinode.bind(this);
    const getLinodeId = path(['linodeId']);
    const id = getLinodeId(this.props);
    const prevId = getLinodeId(prevProps);

    if (!id) {
      return;
    }

    if (!prevId || prevId !== id) {
      boundGetConfigsForLinode();
    }
  }
});

function getConfigsForLinode(this: {
  setState: (state: Partial<ConfigsState>) => void;
  props: LinodeId;
}) {
  const { linodeId } = this.props;

  if (!linodeId) {
    return;
  }

  this.setState({
    configs: [],
    configsLoading: true
  });

  getLinodeConfigs(linodeId)
    .then(({ data }) => {
      this.setState({
        configsLoading: false,
        configs: data
      });
    })
    .catch(configsError => {
      this.setState({
        configsLoading: false,
        configsError
      });
    });
}

type LinodeFields =
  | 'id'
  | 'alerts'
  | 'backups'
  | 'created'
  | 'region'
  | 'image'
  | 'group'
  | 'ipv4'
  | 'ipv6'
  | 'label'
  | 'status'
  | 'updated'
  | 'hypervisor'
  | 'specs'
  | 'watchdog_enabled'
  | 'tags';

interface ExtendedLinode extends Pick<Linode.Linode, LinodeFields> {
  type?: Linode.LinodeType;
  configs: Linode.Config[];
}

interface WithLinode {
  linodeData?: Linode.Linode;
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

const withLinode = connect(
  (state: ApplicationState, ownProps: LinodeId & ConfigsState): WithLinode => {
    const { linodeId } = ownProps;
    const {
      entities: linodes,
      loading: linodesLoading,
      error: linodesError
    } = state.__resources.linodes;

    const linode = linodes.find(l => l.id === linodeId);

    return {
      linodeData: linode,
      linodesError,
      linodesLoading
    };
  }
);

interface WithType {
  typeData?: Linode.LinodeType;
  typesLoading: boolean;
  typesError?: Linode.ApiFieldError[];
}

const withType = connect(
  (state: ApplicationState, ownProps: WithLinode): WithType => {
    const { linodeData } = ownProps;
    const {
      entities: types,
      loading: typesLoading,
      error: typesError
    } = state.__resources.types;

    if (!linodeData) {
      return {
        typesLoading,
        typesError
      };
    }

    return {
      typeData: types.find(t => t.id === linodeData.type),
      typesLoading,
      typesError
    };
  }
);

interface LinodeId {
  linodeId: number;
}

const composeLinode = compose(
  /** Retrieve the Linode from Redux. */
  withLinode,

  /** Retrieve Type from Linode */
  withType,

  /** Merge type and configs onto Linode. */
  mapProps(ownProps => mergeProps(ownProps)),

  /** Discard transient props. */
  mapProps(ownProps => stripProps(ownProps))
);

const linodeIdFromRoute = withProps((ownProps: RouteProps) => ({
  linodeId: Number(ownProps.match.params.linodeId)
}));

const dataContainer = compose(
  /* Map the linodeId to a number and to a top-level prop. */
  linodeIdFromRoute,

  /* Get the Linode Configurations from API and merge onto Linode at `configs`. */
  withConfigs,

  /* Get the Linode and Type from Redux. Merge config and type onto Linode. Exposes error and loading.*/
  composeLinode
);

const mergeProps = <T extends any>({
  linodeData,
  typeData,
  configs,
  linodesLoading,
  typesLoading,
  configsLoading,
  linodesError,
  typesError,
  configsError,
  ...rest
}: T) => ({
  linode: { ...linodeData, type: typeData, configs },
  loading: linodesLoading || typesLoading || configsLoading,
  error: linodesError || typesError || configsError,
  ...rest
});

const stripProps = omit([
  'configs',
  'configsLoading',
  'dispatch',
  'history',
  'linodeId',
  'location',
  'match',
  'staticContext',
  'linodesError',
  'linodesLoading',
  'typesLoading',
  'typesError'
]);

const displayContainer = compose(
  branch<
    RouteProps & {
      loading: boolean;
      error?: Linode.ApiFieldError[];
      linode?: Linode.Linode;
    }
  >(
    ({ error }) => Boolean(error),
    renderComponent(() => <ErrorState errorText="Unable to loading Linode." />)
  ),

  branch<
    RouteProps & {
      loading: boolean;
      error?: Linode.ApiFieldError[];
      linode?: Linode.Linode;
    }
  >(({ loading }) => loading, renderComponent(() => <CircleProgress />)),

  branch<
    RouteProps & {
      loading: boolean;
      error?: Linode.ApiFieldError[];
      linode?: Linode.Linode;
    }
  >(({ linode }) => linode === undefined, renderComponent(() => <NotFound />))
);

const enhanced = compose(
  styled,
  dataContainer,
  displayContainer
);

export default enhanced(LinodeDetail);
