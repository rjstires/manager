import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import ThemeDecorator from '../../utilities/storybookDecorators';

import TableWrapper from './Table';


storiesOf('Table', module)
  .addDecorator(ThemeDecorator)
  .add('default', () => (
    <TableWrapper>
      <TableHead>
        <TableRow>
          <TableCell>Head-1-1</TableCell>
          <TableCell>Head-1-2</TableCell>
          <TableCell>Head-1-3</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Col-1-1</TableCell>
          <TableCell>Col-1-2</TableCell>
          <TableCell>Col-1-3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Col-2-1</TableCell>
          <TableCell>Col-2-2</TableCell>
          <TableCell>Col-2-3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Col-3-1</TableCell>
          <TableCell>Col-3-2</TableCell>
          <TableCell>Col-3-3</TableCell>
        </TableRow>
      </TableBody>
    </TableWrapper>
));
