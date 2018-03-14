import * as React from 'react';
import * as classnames from 'classnames';
import { withStyles, Theme, StyleRulesCallback, WithStyles, Button } from 'material-ui';
import LinodeTheme from '../../../src/theme';

type CSSClasses = 'root' | 'first' | 'last'| 'active';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    backgroundColor: LinodeTheme.bg.offWhite,
    color: theme.palette.primary.main,
    border: '1px solid ' + `${LinodeTheme.color.grey2}`,
    borderRight: 0,
    padding: theme.spacing.unit * 2,
    minWidth: 58,
    '&.active': {
      backgroundColor: LinodeTheme.bg.main,
      color: 'black',
    },
    '&:last-child': {
      borderRight: '1px solid ' + `${LinodeTheme.color.grey2}`,
    },
  },
  active: {},
  first: {},
  last: {},
});

const styled = withStyles<CSSClasses>(styles, { withTheme: true });

interface Props {
  active?: Boolean;
  page?: number; 
  first?: Boolean;
  last?: Boolean;
  onClick: () => void;
}

const PageButton: React.StatelessComponent<Props & WithStyles<CSSClasses>> = ((props) => {
  const {
    active,
    classes,
    page,
    first,
    last,
    onClick,
  } = props;

  const rootClasses = classnames({
    [classes.root]: true,
    // TSLint and the typedefs for classnames are preventing me from using shorthand here.
    active: active === true,
  });

  if (first) {
    return <Button className={`${rootClasses} ${classes.first}` } onClick={onClick}>First</Button>;
  }

  if (last) {
    return <Button className={`${rootClasses} ${classes.last}` } onClick={onClick}>Last</Button>;
  }

  return (
    <Button className={rootClasses} onClick={onClick}>{page}</Button>
  );
});

export default styled(PageButton);
