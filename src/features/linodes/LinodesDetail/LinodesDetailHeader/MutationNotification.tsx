import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import { startMutation } from 'src/services/linodes';
import {
  withTypes,
  WithTypes
} from 'src/store/linodeType/linodeType.containers';
import linodeDetailContext from '../context';
import MutateDrawer from '../MutateDrawer';

type ClassNames = 'pendingMutationLink';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  pendingMutationLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
});

type CombinedProps = WithTypes & WithStyles<ClassNames>;

interface DrawerState {
  open: boolean;
  loading: boolean;
  error: string;
}
const MutationNotification: React.StatelessComponent<CombinedProps> = props => {
  const { classes, types } = props;

  const { linode } = React.useContext(linodeDetailContext);
  const { _type } = linode;

  /** Mutate */
  if (!_type) {
    throw Error(`Unable to locate type information.`);
  }

  const successorId = _type.successor;

  const [mutationDrawerState, setMutationDrawerState] = React.useState<
    DrawerState
  >({
    open: false,
    loading: false,
    error: ''
  });

  const successorType = successorId
    ? types.find(({ id }) => id === successorId)
    : null;
  const { vcpus, network_out, disk, transfer, memory } = _type;

  const initMutation = () => {
    // const { mutateDrawer } = this.state;
    // const { linode } = this.props;

    if (!linode) {
      return;
    }

    setMutationDrawerState({
      ...mutationDrawerState,
      loading: true,
      error: ''
    });

    /*
     * It's okay to disregard the possiblity of linode
     * being undefined. The upgrade message won't appear unless
     * it's defined
     */
    startMutation(linode.id)
      .then(() => {
        setMutationDrawerState({
          ...mutationDrawerState,
          open: false,
          error: '',
          loading: false
        });

        // @todo SNACKBAR!!!!
        // this.props.enqueueSnackbar('Linode upgrade has been initiated.', { variant: 'info' });
      })
      .catch(errors => {
        setMutationDrawerState({
          ...mutationDrawerState,
          loading: false,
          error: pathOr(
            'Mutation could not be initiated.',
            ['response', 'data', 'errors', 0, 'reason'],
            errors
          )
        });
      });
  };

  if (!successorId || !successorType) {
    return null;
  }

  return (
    <>
      <Notice important warning>
        {`This Linode has pending upgrades available. To learn more about
this upgrade and what it includes, `}
        <span
          className={classes.pendingMutationLink}
          onClick={() =>
            setMutationDrawerState({
              open: true,
              loading: false,
              error: ''
            })
          }
        >
          click here.
        </span>
      </Notice>
      <MutateDrawer
        linodeId={linode.id}
        open={mutationDrawerState.open}
        loading={mutationDrawerState.loading}
        error={mutationDrawerState.error}
        handleClose={() =>
          setMutationDrawerState({
            ...mutationDrawerState,
            open: false
          })
        }
        mutateInfo={{
          vcpus: successorType.vcpus !== vcpus ? successorType.vcpus : null,
          network_out:
            successorType.network_out !== network_out
              ? successorType.network_out
              : null,
          disk: successorType.disk !== disk ? successorType.disk : null,
          transfer:
            successorType.transfer !== transfer ? successorType.transfer : null,
          memory: successorType.memory !== memory ? successorType.memory : null
        }}
        currentTypeInfo={{
          vcpus: linode.specs.vcpus,
          transfer: linode.specs.transfer,
          disk: linode.specs.disk,
          memory: linode.specs.memory,
          network_out
        }}
        initMutation={initMutation}
      />
      )
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withTypes()
);

export default enhanced(MutationNotification);
