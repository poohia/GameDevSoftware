import { useCallback, useEffect, useMemo, useState } from 'react';
import { DropdownConstantTypesComponent } from 'renderer/components';
import { Grid, Header, Icon, Input, Table } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ConstantObject, ConstantType } from 'types';

type ConstantTableComponentProps = {
  constants: ConstantObject[];
  keySelected?: string;
  canDelete: boolean;
  defaultFilterType?: ConstantType;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const ConstantTableComponent = (props: ConstantTableComponentProps) => {
  const {
    constants,
    keySelected,
    canDelete,
    defaultFilterType,
    onClickRow,
    onDelete,
  } = props;
  const [filter, setFilter] = useState<string>('');
  const [filterType, setFilterType] = useState<ConstantType | string>(
    defaultFilterType || ''
  );
  const formatData = useMemo(() => {
    let _constants = constants;
    if (filter !== '') {
      _constants = _constants.filter((c) => c.key.includes(filter));
    }
    if (filterType !== '') {
      _constants = _constants.filter((c) => {
        const { value } = c;
        if (
          filterType === 'number[]' &&
          Array.isArray(value) &&
          typeof value[0] === 'number'
        ) {
          return true;
        }
        if (
          filterType === 'string[]' &&
          Array.isArray(value) &&
          typeof value[0] === 'string'
        ) {
          return true;
        }
        if (filterType === 'number' && typeof value === 'number') {
          return true;
        }
        if (filterType === 'string' && typeof value === 'string') {
          return true;
        }
        return false;
      });
    }
    return _constants;
  }, [filter, filterType, constants]);
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

  const lengthConstants = useMemo(
    () => Object.keys(formatData).length,
    [formatData]
  );

  useEffect(() => {
    setFilter(filter.toLocaleLowerCase().replace(' ', '_'));
  }, [filter]);

  return (
    <Grid className="game-dev-software-table-component">
      <Grid.Row className="game-dev-software-table-component-search">
        <Grid.Column width={12}>
          <Input
            icon="search"
            placeholder="Search..."
            value={filter}
            fluid
            onChange={(_, { value }) => setFilter(value as string)}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <DropdownConstantTypesComponent
            placeholder="Constant type"
            onChange={(_: any, data: any) => setFilterType(data.value)}
            clearable
            defaultValue={defaultFilterType}
            disabled={!!defaultFilterType}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formatData.map(({ key, value, description }) => (
                <Table.Row
                  key={key}
                  active={keySelected === key}
                  onClick={() => onClickRow(key)}
                >
                  <Table.Cell width={16}>
                    <Header as="h3" textAlign="left">
                      {key}
                      <Header.Subheader>{formatString(value)}</Header.Subheader>
                    </Header>
                    {description && (
                      <p>
                        <i>{description}</i>
                      </p>
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        canDelete && onDelete(key);
                      }}
                      disabled={!canDelete}
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
    </Grid>
  );
};

export default ConstantTableComponent;
