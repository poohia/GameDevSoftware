import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Container, Grid, Header } from 'semantic-ui-react';
import { AssetType } from 'types';
import { formatBase64 } from 'utils';

type AssetPreviewComponentProps = {
  asset: AssetType;
};

const AssetPreviewComponent = (props: AssetPreviewComponentProps) => {
  const { asset } = props;
  const { name, type, module } = asset;

  const { once, sendMessage } = useEvents();
  const [base64, setBase64] = useState<string | undefined>();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const content = useMemo(() => {
    if (!base64) {
      return null;
    }
    switch (type) {
      case 'image':
        const img = new Image();
        img.src = base64;
        return img;
      case 'video':
        const video = document.createElement('video');
        video.src = base64;
        return video;
      default:
        return null;
    }
  }, [base64]);

  const updateInformations = useCallback(() => {
    if (content instanceof HTMLImageElement) {
      setWidth(content.naturalWidth);
      setHeight(content.naturalHeight);
    } else if (content instanceof HTMLVideoElement) {
      setWidth(content.videoWidth);
      setHeight(content.videoHeight);
    }
  }, [content]);

  useEffect(() => {
    if (base64) {
      const base64Length = base64.length;
      const bytes = (base64Length * 3) / 4;
      const kilobytes = bytes / 1024;
      setLength(Number(kilobytes.toFixed(2)));
    }
  }, [base64]);

  useEffect(() => {
    sendMessage('get-asset-information', { name, type, module });
    once('get-asset-information', (arg: string) => {
      setBase64(formatBase64(type, arg, name));
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
        <Grid.Row columns={2}>
          {width > 0 && (
            <Grid.Column>
              size: {width}x{height} px
            </Grid.Column>
          )}
          {length > 0 && <Grid.Column>length: {length} ko</Grid.Column>}
        </Grid.Row>
        <Grid.Row className="game-dev-software-file-preview-content">
          {type === 'image' && base64 && (
            <img src={base64} onLoad={updateInformations} />
          )}
          {type === 'sound' && base64 && <audio src={base64} controls />}
          {type === 'video' && base64 && (
            <video
              width="320"
              height="240"
              controls
              src={base64}
              onLoadedData={updateInformations}
            />
          )}
          {type === 'json' && base64 && <code>{base64}</code>}
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AssetPreviewComponent;
