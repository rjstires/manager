import { connect, MapDispatchToProps } from 'react-redux';
import { requestRegions } from '../store/reducers/orm/region/region.actions';
import { requestTypes } from '../store/reducers/orm/type/type.actions';

export interface BootstrapActions {
  _requestRegions: () => void;
  _requestTypes: () => void;
}

const dispatchToProps: MapDispatchToProps<BootstrapActions, {}> = (dispatch) => {
  return {
    _requestRegions: () => dispatch(requestRegions()),
    _requestTypes: () => dispatch(requestTypes()),
  };
};

export default connect(undefined, dispatchToProps);
