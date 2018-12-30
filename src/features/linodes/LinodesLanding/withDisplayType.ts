import { connect, MapStateToProps } from 'react-redux';
import getLinodeType from 'src/utilities/getLinodeType';

export interface WithDisplayType {
  displayType: string;
}

const mapStateToProps: MapStateToProps<WithDisplayType, { linodeType: string }, ApplicationState> = (state, ownProps) => {
  const { linodeType } = ownProps;
  const { itemsById } = state.orm.type.data;
  const type = getLinodeType(itemsById, linodeType);

  return ({
    displayType:
      type === null
        ? 'No Plan'
        : type === undefined
          ? 'Unknown Plan'
          : type.label,
  })
};

export default connect(mapStateToProps);
