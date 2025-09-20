import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DialogShortcutsFoldersComponent,
  DropdownConstantTypesComponent,
  DropdownShortcutsFoldersComponent,
  TransComponent,
} from 'renderer/components';
import { Checkbox, Grid, Header, Icon, Input } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';
import { ConstantObject, ConstantType, ShortcutsFolder } from 'types';
import { useDatabase } from 'renderer/hooks';

type ConstantTableComponentProps = {
  constants: ConstantObject[];
  keySelected?: string;
  defaultFilterType?: ConstantType;
  module: string | null;
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};
const ConstantTableComponent: React.FC<ConstantTableComponentProps> = (
  props
) => {
  const {
    constants,
    keySelected,
    defaultFilterType,
    module,
    onClickRow,
    onDelete,
  } = props;
  const { setItem, getItem } = useDatabase();
  const [filter, setFilter] = useState<string>(() => {
    return getItem('constant-filter') || '';
  });
  const [filterType, setFilterType] = useState<ConstantType | string>(
    defaultFilterType || ''
  );
  const [folderFilter, setFilterFolder] = useState<ShortcutsFolder[] | null>(
    null
  );
  const [filterModule, setFilterModule] = useState<boolean>(true);
  const [openIdShortcutsFolder, setOpenIdShortcutsFolder] = useState<
    string | null
  >(null);

  const formatData = useMemo(() => {
    let _constants = constants.map((constant) => ({
      ...constant,
      key: constant.key.toLowerCase(),
    }));
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
    if (!filterModule) {
      _constants = _constants.filter(
        (predicate) => typeof predicate.module === 'undefined'
      );
    }
    if (module) {
      _constants = _constants.filter((c) => c.module === module);
    }

    if (folderFilter && folderFilter.length > 0) {
      const allowedKeys = new Set(
        folderFilter
          .flatMap((f) => f.constants ?? [])
          .map((k) => k.toLowerCase()) // ↓ cohérent avec key.toLowerCase()
      );

      _constants = _constants.filter((c) => allowedKeys.has(c.key));
    }
    return _constants.reverse();
  }, [filter, filterType, filterModule, constants, folderFilter]);
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
    setItem('constant-filter', filter);
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
            onChange={(_, { value }) =>
              setFilter(value.toLocaleLowerCase().replace(' ', '_'))
            }
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
        <Grid.Column width={10}>
          <DropdownShortcutsFoldersComponent onChange={setFilterFolder} />
        </Grid.Column>
        <Grid.Column width={6}>
          <Checkbox
            label={i18n.t('table_filter_module')}
            checked={filterModule}
            onClick={() => !module && setFilterModule(!filterModule)}
            disabled={!!module}
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
              {formatData.map(({ key, value, description, deletable }) => (
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
                  <Table.Cell textAlign="right" className="action">
                    <div>
                      <Button
                        basic
                        icon
                        color="teal"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenIdShortcutsFolder(key);
                        }}
                      >
                        <Icon name="folder" />
                      </Button>
                      <Button
                        basic
                        icon
                        color="red"
                        onClick={(event) => {
                          event.stopPropagation();
                          deletable && onDelete(key);
                        }}
                        disabled={!deletable}
                      >
                        <Icon name="trash" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <TransComponent id="module_table_count" />
                  :&nbsp;
                  <b>{lengthConstants}</b>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
      {openIdShortcutsFolder !== null && (
        <DialogShortcutsFoldersComponent
          id={openIdShortcutsFolder}
          typeTarget={'constants'}
          multiple
          onClose={() => {
            setOpenIdShortcutsFolder(null);
          }}
        />
      )}
    </Grid>
  );
};

export default ConstantTableComponent;
