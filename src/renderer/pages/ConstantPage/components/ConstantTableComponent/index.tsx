import { useCallback } from 'react';
import { Grid, Header, Table } from 'semantic-ui-react';
import { ConstantObject } from 'types';

type ConstantTableComponentProps = {
  constants: ConstantObject;
};
const ConstantTableComponent = (props: ConstantTableComponentProps) => {
  const { constants } = props;
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
  return (
    <div>
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Table celled striped selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell colSpan="2">Value</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Object.keys(constants).map((key) => (
                  <Table.Row key={key}>
                    <Table.Cell width={16}>
                      <Header as="h3" textAlign="left">
                        {key}
                        <Header.Subheader>
                          {formatString(constants[key])}
                        </Header.Subheader>
                      </Header>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default ConstantTableComponent;
