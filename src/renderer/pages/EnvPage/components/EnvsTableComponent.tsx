import { TransComponent } from 'renderer/components';
import { Button, Table } from 'renderer/semantic-ui';
import { Grid, Icon } from 'semantic-ui-react';
import { EnvObject } from 'types';

type EnvsTableComponentProps = {
  productionEnvs: EnvObject[];
  developmentEnvs: EnvObject[];
  onClickRow: (key: string) => void;
  onDelete: (key: string) => void;
};

const EnvsTableComponent: React.FC<EnvsTableComponentProps> = (props) => {
  const { productionEnvs, developmentEnvs, onClickRow, onDelete } = props;

  return (
    <Grid className="game-dev-software-table-component-unscroll">
      <Grid.Row>
        <Grid.Column>
          <Table celled selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <TransComponent id="table_header_key" />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <TransComponent id="module_env_form_development_value_label" />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <TransComponent id="module_env_form_production_value_label" />
                </Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {productionEnvs.map((env) => (
                <Table.Row
                  key={`table-row-env-development-${env.key}`}
                  onClick={() => onClickRow(env.key)}
                  disabled={env.key === 'ENV'}
                >
                  <Table.Cell>{env.key}</Table.Cell>
                  <Table.Cell>
                    {developmentEnvs.find((e) => e.key === env.key)?.value}
                  </Table.Cell>
                  <Table.Cell>{env.value}</Table.Cell>
                  <Table.Cell>
                    <Button
                      basic
                      icon
                      color="red"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(env.key);
                      }}
                      disabled={env.key === 'ENV'}
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default EnvsTableComponent;
