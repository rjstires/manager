import { connect, MapStateToProps } from 'react-redux';
import { MapToProps } from './types';

type Entity = Linode.Region;

export interface Props {
  regionsData: Entity[];
  regionsLoading: boolean;
  regionsError?: Error;
}

const mapState = <U>(map: MapToProps<Entity[], U>): MapStateToProps<U, {}, ApplicationState> => (state) => {
  const { data, loading, error } = state.orm.region;
  const { items, itemsById } = data;
  const list = items.map((id) => itemsById[id]);

  return map(list, loading, error);
}

const defaultMapToProps: MapToProps<Entity[], Props> = (list, loading, error): Props => ({
  regionsData: list,
  regionsLoading: loading,
  regionsError: error,
});

export default <T = Props>(mapToProps: MapToProps<Entity[], T | Props> = defaultMapToProps) => {
  return connect(mapState(mapToProps))
};


