import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import { pathOr } from 'ramda';

import { Subscription } from 'rxjs/Rx';

import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import { events$ } from 'src/events';
import { openForCreating } from 'src/store/reducers/volumeDrawer';
import { getVolumes } from 'src/services/volumes';

import VolumesLanding from './VolumesLanding';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  volumes: PromiseLoaderResponse<Linode.Volume[]>;
  openForCreating: typeof openForCreating;
}

interface State {
  volumes: Linode.Volume[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class Volumes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  mounted: boolean = false;

  state = {
    volumes: pathOr([], ['response', 'data'], this.props.volumes),
  };

  componentDidMount() {
    this.mounted = true;

    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'volume_create',
          'volume_attach',
          'volume_delete',
          'volume_detach',
          'volume_resize',
          'volume_clone',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        getVolumes()
          .then((volumes) => {
            this.setState({ volumes: volumes.data });
          })
          .catch(() => {
            /* @todo: how do we want to display this error? */
          });
      });
  }

  openVolumesDrawer() {
    this.props.openForCreating();
  }

  render() {
    const { volumes } = this.state;
    return (
      <React.Fragment>
        {volumes.length
          ? <VolumesLanding
              volumes={volumes}
            />
          : <Placeholder
              title="Create a Volume"
              copy="Add storage to your Linodes using the resilient Volumes service"
              icon={VolumesIcon}
              buttonProps={{
                onClick: () => this.openVolumesDrawer(),
                children: 'Create a Volume',
              }}
            />
        }
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<CombinedProps>({
  volumes: (props: Props) => getVolumes(),
});

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForCreating },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default connected(styled(preloaded(Volumes)));
