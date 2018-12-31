import { connect, MapStateToProps } from 'react-redux';

export type MapToProps<T, U, OwnProps> = (p: { data: T, loading: boolean, error?: Error }, ownProps: OwnProps) => U

type Entity = Linode.Volume;

export interface Props {
  volumesData: Entity[];
  volumesLoading: boolean;
  volumesError?: Error;
}

const mapState = <U, OwnProps>(map: MapToProps<Entity[], U, OwnProps>): MapStateToProps<U, {}, ApplicationState> => (state, ownProps: OwnProps) => {
  const { items, itemsById } = state.orm.volume;
  const list = items.map((id) => itemsById[id]);

  return map({ data: list, loading: false, error: undefined }, ownProps);
}

const defaultMapToProps: MapToProps<Entity[], Props, {}> = ({ data, loading, error }, ownProps): Props => ({
  volumesData: data,
  volumesLoading: loading,
  volumesError: error,
});

export default <T = Props, OwnProps = any>(mapToProps: MapToProps<Entity[], T | Props, OwnProps> = defaultMapToProps) => {
  return connect(mapState(mapToProps))
};
