import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import { HelpOutline } from '@material-ui/icons';

interface Props {
  text: string;
}

interface State {
  open: boolean;
  anchorEl?: HTMLElement;
  anchorReference: string;
}

type ClassNames = 'root' | 'helpIcon';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => ({
  root: {
    '& .helpPaper': {
      padding: theme.spacing.unit * 2,
      backgroundColor: theme.bg.offWhite,
      maxWidth: 300,
      '&::after': {
        content: 'poo',
        display: 'block',
      },
    },
  },
  helpIcon: {
    color: theme.palette.primary.main,
  },
});

const styled = withStyles(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<ClassNames>;

class HelpIcon extends React.Component<CombinedProps, State> {
  state = {
    open: false,
    anchorEl: undefined,
    anchorReference: 'anchorEl',
  };

  constructor(props: CombinedProps) {
    super(props);
  }

  button = null;

  handleClose = () => {
    this.setState({
      open: false,
    });
  }

  handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      open: true,
      anchorEl: e.currentTarget,
    });
  }

  render() {
    const { classes, text } = this.props;
    return (
      <React.Fragment>
        <IconButton
          onMouseOver={this.handleOpen}
          data-qa-help-button>
          <HelpOutline className={classes.helpIcon} />
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.root}
          classes={{ paper: 'helpPaper' }}
          onMouseOut={this.handleClose}
        >
          <Typography data-qa-popover-text>{ text }</Typography>
        </Popover>
      </React.Fragment>
    );
  }
}

export default styled(HelpIcon);
