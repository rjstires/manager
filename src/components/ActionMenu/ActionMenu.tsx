import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  withStyles, WithStyles, StyleRulesCallback, Theme,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import MoreHoriz from 'material-ui-icons/MoreHoriz';

export interface Action {
  title: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type CSSClasses = 'item' | 'buttonWrapper' | 'button';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  item: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    marginTop: '0 !important',
  },
  buttonWrapper: {
    marginTop: theme.spacing.unit,
  },
  button: {
    height: 30,
  },
});

interface Props {
  createActions: (push: Function, closeMenu: Function) => Action[];
}

interface State {
  actions?: Action[];
  anchorEl?: Linode.TodoAny;
}

type FinalProps = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

class ActionMenu extends React.Component<FinalProps, State> {
  state = {
    actions: [],
    anchorEl: undefined,
  };

  componentDidMount() {
    const { createActions, history } = this.props;
    this.setState({
      actions: createActions(history.push, this.handleClose),
    });
  }

  handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes  } = this.props;
    const { actions, anchorEl  } = this.state;

    if (typeof actions === 'undefined') { return null; }

    return actions.length === 1
<<<<<<< HEAD
      ? actions.map((a, idx) => <a href="#" key={idx} onClick={e => a.onClick(e)}>{a.title}</a>)
      : (<div className={classes.buttonWrapper}>
=======
      ? (actions as Action[]).map((a, idx) =>
          <a href="#" key={idx} onClick={e => a.onClick(e)}>{a.title}</a>)
      : (<div>
>>>>>>> 2165a2eb... refactor menu action generation to allow menu close
        <IconButton
          aria-owns={anchorEl ? 'action-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
        >
          <MoreHoriz color="primary" />
        </IconButton >
        <Menu
          id="action-menu"
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {(actions as Action[]).map((a, idx) =>
            <MenuItem
              key={idx}
              onClick={a.onClick}
              className={classes.item}
            >{a.title}</MenuItem>,
          )}
        </Menu>
      </div >);
  }
}

export const RoutedActionMenu = withRouter(ActionMenu);

export default withStyles(styles, { withTheme: true })<Props>(RoutedActionMenu);
