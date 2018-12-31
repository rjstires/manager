import { connect, MapStateToProps } from 'react-redux';
import { MapToProps } from './types';

type Entity = Linode.LinodeType;

export interface Props {
  typesData: Entity[];
  typesLoading: boolean;
  typesError?: Error;
}

const mapState = <U>(map: MapToProps<Entity[], U>): MapStateToProps<U, {}, ApplicationState> => (state) => {
  const { items, itemsById } = state.orm.type;
  const { read: { loading, error } } = state.requests.type;
  const list = items.map((id) => itemsById[id]);

  return map(list, loading, error);
}

const defaultMapToProps: MapToProps<Entity[], Props> = (list, loading, error): Props => ({
  typesData: list,
  typesLoading: loading,
  typesError: error,
});

export default <T = Props>(mapToProps: MapToProps<Entity[], T | Props> = defaultMapToProps) => {
  return connect(mapState(mapToProps))
};


