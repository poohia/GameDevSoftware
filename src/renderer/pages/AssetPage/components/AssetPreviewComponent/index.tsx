import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Container, Grid, Header } from 'semantic-ui-react';
import { AssetType } from 'types';
import { formatBase64 } from 'utils';

type AssetPreviewComponentProps = {
  asset: AssetType;
};

const AssetPreviewComponent = (props: AssetPreviewComponentProps) => {
  const { asset } = props;
  const { name, type } = asset;

  const { once, sendMessage } = useEvents();
  const [base64, setBase64] = useState<string | undefined>();

  useEffect(() => {
    sendMessage('get-asset-information', { name, type });
    once('get-asset-information', (arg: string) => {
      setBase64(formatBase64(type, arg));
    });
  }, [asset]);

  return (
    <Container fluid>
      <Grid className="game-dev-software-form-container">
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">{name}</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className="game-dev-software-file-preview-content">
          {type === 'image' && base64 && <img src={base64} />}
          {type === 'sound' && base64 && <audio src={base64} controls />}
          {type === 'video' && base64 && (
            <video width="320" height="240" controls src={base64} />
          )}
          {type === 'json' && base64 && <code>{base64}</code>}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetPreviewComponent;
