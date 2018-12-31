import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { orm } from 'src/store/orm';

export interface WithTypeProps {
  type?: Linode.LinodeType;
}

const typeForLinode = (linodeType: string) => createSelector(
  (state: ApplicationState) => state.orm,
  (database) => {
    const session = orm.session(database);

    return session.type.get({ id: linodeType }).ref;
  }
);

const mapStateToProps = createStructuredSelector({
  type: (state: ApplicationState, ownProps: { linodeType: string }) => typeForLinode(ownProps.linodeType)(state),
});

export default connect(mapStateToProps);
