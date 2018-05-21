import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { powerOnLinode } from './powerActions';

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: string;
  openConfigDrawer: (configs: Linode.Config[], fn: (id: number) => void) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<CombinedProps> {
  createLinodeActions = () => {
    const { linodeId, linodeLabel, linodeStatus,
       openConfigDrawer, toggleConfirmation, history: { push } } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/glish`);
            e.preventDefault();
          },
        },
        {
          title: 'Reboot',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            toggleConfirmation('reboot', linodeId, linodeLabel);
            closeMenu();
          },
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/summary`);
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/resize`);
            e.preventDefault();
          },
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/backup`);
            e.preventDefault();
          },
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linodeId}/settings`);
            e.preventDefault();
          },
        },
      ];

      if (linodeStatus === 'offline') {
        actions.unshift({
          title: 'Power On',
          onClick: (e) => {
            powerOnLinode(openConfigDrawer, linodeId, linodeLabel);
            closeMenu();
          },
        });
      }

      if (linodeStatus === 'running') {
        actions.unshift({
          title: 'Power Off',
          onClick: (e) => {
            toggleConfirmation('power_down', linodeId, linodeLabel);
            closeMenu();
          },
        });
      }

      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createLinodeActions()} />
    );
  }
}

export default withRouter(LinodeActionMenu);
