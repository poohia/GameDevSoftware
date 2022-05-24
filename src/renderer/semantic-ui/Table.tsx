import { useContext } from 'react';
import { Table as TableSemantic, TableProps } from 'semantic-ui-react';
import DarkModeContext from 'renderer/contexts/DarkModeContext';

const Table = (props: TableProps) => {
  const { darkModeActived } = useContext(DarkModeContext);

  return (
    <TableSemantic {...props} inverted={darkModeActived}>
      {props.children}
    </TableSemantic>
  );
};
Table.Header = TableSemantic.Header;
Table.Row = TableSemantic.Row;
Table.HeaderCell = TableSemantic.HeaderCell;
Table.Body = TableSemantic.Body;
Table.Cell = TableSemantic.Cell;
Table.Footer = TableSemantic.Footer;
export default Table;
