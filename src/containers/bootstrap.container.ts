import { connect, MapDispatchToProps } from 'react-redux';
import { requestRegions } from '../store/orm/region/region.actions';
import { requestTypes } from '../store/orm/type/type.actions';
import { requestVolumes } from '../store/orm/volume/volume.actions';

export interface BootstrapActions {
  _requestRegions: () => void;
  _requestTypes: () => void;
  _requestVolumes: () => void;
}

const dispatchToProps: MapDispatchToProps<BootstrapActions, {}> = {
  _requestRegions: requestRegions,
  _requestTypes: requestTypes,
  _requestVolumes: requestVolumes,
};

export default connect(undefined, dispatchToProps);
