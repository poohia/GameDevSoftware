import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Grid, Header, Icon, Input, Table } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ConstantObject } from 'types';

type ConstantTableComponentProps = {
  constants: ConstantObject;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const ConstantTableComponent = (props: ConstantTableComponentProps) => {
  const { constants, onClickRow, onDelete } = props;
  const [filter, setFilter] = useState<string>('');

  const lengthConstants = useMemo(
    () => Object.keys(constants).length,
    [constants]
  );
  const formatData = useCallback(() => {
    if (filter !== '') {
      return Object.keys(constants).filter((key) => key.includes(filter));
    }
    return Object.keys(constants);
  }, [filter, constants]);
  const formatString = useCallback(
    (value: number | number[] | string | string[]) => {
      if (Array.isArray(value)) {
        return typeof value[0] === 'number'
          ? `[${value.join(', ')}]`
          : `[${value.map((v) => `'${v}'`).join(', ')}]`;
      } else return typeof value === 'number' ? value : `'${value}'`;
    },
    []
  );

  useEffect(() => {
    setFilter(filter.toLocaleLowerCase().replace(' ', '_'));
  }, [filter]);

  return (
    <div className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Input
          icon="search"
          placeholder="Search..."
          value={filter}
          onChange={(_, { value }) => setFilter(value as string)}
        />
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Table celled striped selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formatData().map((key) => (
                <Table.Row key={key} onClick={() => onClickRow(key)}>
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {key}
                      <Header.Subheader>
                        {formatString(constants[key])}
                      </Header.Subheader>
                    </Header>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(key);
                      }}
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  {i18n.t('module_table_count')}:&nbsp;
                  <b>{lengthConstants}</b>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </div>
  );
};

export default ConstantTableComponent;