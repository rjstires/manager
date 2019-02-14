import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import TabLink from 'src/components/TabLink';
import VolumesLanding from 'src/features/Volumes/VolumesLanding';
import LinodeBackup from './LinodeBackup';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from './linodeDetailContext';
import LinodeNetworking from './LinodeNetworking';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';

type CombinedProps = LinodeDetailContext &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    match: { url },
    linode
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${url}/summary`, title: 'Summary' },
    { routeName: `${url}/volumes`, title: 'Volumes' },
    { routeName: `${url}/networking`, title: 'Networking' },
    { routeName: `${url}/resize`, title: 'Resize' },
    { routeName: `${url}/rescue`, title: 'Rescue' },
    { routeName: `${url}/rebuild`, title: 'Rebuild' },
    { routeName: `${url}/backup`, title: 'Backups' },
    { routeName: `${url}/settings`, title: 'Settings' }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
              component={() => <TabLink to={tab.routeName} title={tab.title} />}
            />
          ))}
        </Tabs>
      </AppBar>
      <Switch>
        <Route
          exact
          path={`/linodes/:linodeId/summary`}
          component={LinodeSummary}
        />
        <Route
          exact
          path={`/linodes/:linodeId/volumes`}
          render={routeProps => (
            <VolumesLanding
              linodeId={linode.id}
              linodeLabel={linode.label}
              linodeRegion={linode.region}
              linodeConfigs={linode._configs}
              {...routeProps}
            />
          )}
        />
        <Route
          exact
          path={`/linodes/:linodeId/networking`}
          component={LinodeNetworking}
        />
        <Route
          exact
          path={`/linodes/:linodeId/resize`}
          component={LinodeResize}
        />
        <Route
          exact
          path={`/linodes/:linodeId/rescue`}
          component={LinodeRescue}
        />
        <Route
          exact
          path={`/linodes/:linodeId/rebuild`}
          component={LinodeRebuild}
        />
        <Route
          exact
          path={`/linodes/:linodeId/backup`}
          component={LinodeBackup}
        />
        <Route
          exact
          path={`/linodes/:linodeId/settings`}
          component={LinodeSettings}
        />
        {/* 404 */}
        <Redirect to={`${url}/summary`} />
      </Switch>
    </>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
};

const enhanced = compose<CombinedProps, {}>(
  withRouter,
  withLinodeDetailContext(({ linode }) => ({ linode }))
);

export default enhanced(LinodesDetailNavigation);
