import { useRef, useState } from 'react';
import { ButtonStartStopProjectComponent } from 'renderer/components';
import {
  DropdownSaves,
  DropdownViewportSize,
  RouteInformationComponent,
} from './components';

const ViewPage: React.FC = () => {
  const [viewPortSize, setViewPortSize] = useState<[string, string]>([
    '100%',
    '100%',
  ]);
  const refIframe: React.LegacyRef<HTMLIFrameElement> | null = useRef(null);

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
            onChange={(width, height) => setViewPortSize([width, height])}
          />
        </div>
        {refIframe.current && (
          <RouteInformationComponent refIframe={refIframe.current} />
        )}
        {refIframe.current && (
          <DropdownSaves
            refIframe={refIframe.current}
            onLoadSave={() => {
              if (refIframe.current) {
                refIframe.current.src = refIframe.current.src;
              }
            }}
          />
        )}
      </div>
      <div>
        <iframe
          width={viewPortSize[0]}
          height={viewPortSize[1]}
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
