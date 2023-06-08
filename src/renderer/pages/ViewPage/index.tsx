import { useEffect, useRef, useState } from 'react';
import { ButtonStartStopProjectComponent } from 'renderer/components';
import { useDatabase } from 'renderer/hooks';
import { Button } from 'renderer/semantic-ui';
import { Icon } from 'semantic-ui-react';
import {
  BtnHome,
  DropdownLocale,
  DropdownSaves,
  DropdownSound,
  DropdownViewportSize,
  RouteInformationComponent,
} from './components';

const ViewPage: React.FC = () => {
  const { setItem, getItem } = useDatabase();
  const [orientationLandscape, setOrientationLandscape] = useState<boolean>(
    () => {
      const o = getItem<boolean>('orientationLandscape');
      if (o === null) return true;
      return o;
    }
  );
  const [viewPortSize, setViewPortSize] = useState<[string, string]>([
    '100%',
    '100%',
  ]);
  const refIframe: React.LegacyRef<HTMLIFrameElement> | null = useRef(null);

  useEffect(() => {
    setItem('orientationLandscape', orientationLandscape);
  }, [orientationLandscape]);

  return (
    <div id="game-dev-software-module-view">
      <div>
        <div>
          <ButtonStartStopProjectComponent
            onCLickRefresh={() => {
              if (refIframe.current) {
                refIframe.current.src = refIframe.current.src;
              }
            }}
            onClickUrl={() => window.open('http://localhost:3333', '_blank')}
          />
        </div>
        <div>
          <DropdownViewportSize
            orientation={orientationLandscape ? 'landscape' : 'portrait'}
            onChange={(width, height) => setViewPortSize([width, height])}
          />
          &nbsp;
          <Button
            onClick={() => setOrientationLandscape(!orientationLandscape)}
            color="violet"
            icon
          >
            <Icon name="redo" />
          </Button>
          <br />
          <span>
            {viewPortSize[0]} - {viewPortSize[1]}
          </span>
        </div>
        {refIframe.current && (
          <>
            <RouteInformationComponent refIframe={refIframe.current} />
            <DropdownSaves
              refIframe={refIframe.current}
              onLoadSave={() => {
                if (refIframe.current) {
                  refIframe.current.src = refIframe.current.src;
                }
              }}
            />
            <BtnHome refIframe={refIframe.current} />
            <DropdownLocale refIframe={refIframe.current} />
            <DropdownSound refIframe={refIframe.current} />
          </>
        )}
      </div>
      <div>
        <iframe
          style={{ width: viewPortSize[0], height: viewPortSize[1] }}
          ref={refIframe}
          src="http://localhost:3333"
          onKeyDown={() => {
            console.log('hello worllld');
          }}
        />
      </div>
    </div>
  );
};

export default ViewPage;
