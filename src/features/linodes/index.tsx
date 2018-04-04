import * as React from 'react';
import {
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';

const LinodesLanding = DefaultLoader({
  loader: () => import('./LinodesLanding'),
});

const LinodesCreate = DefaultLoader({
  loader: () => import('./LinodesCreate'),
});

const LinodesDetail = DefaultLoader({
  loader: () => import('./LinodesDetail'),
});

type Props = RouteComponentProps<{}>;

class LinodesRoutes extends React.Component<Props> {
  render() {
    const { match: { path } } = this.props;

    return (
      <Switch>
        <Route component={LinodesDetail} path={`${path}/:linodeId`}/>
        <Route component={LinodesCreate} path={`${path}/create`}/>
        <Route component={LinodesLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(LinodesRoutes);
