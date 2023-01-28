import { useRef } from 'react';
import { ButtonStartStopProjectComponent } from 'renderer/components';

const ViewPage: React.FC = () => {
  const refIframe: React.LegacyRef<HTMLIFrameElement> | null = useRef(null);

  return (
    <div id="game-dev-software-module-view">
      <div>
        <div>
          <ButtonStartStopProjectComponent
            onCLickRefresh={() => {
              if (refIframe.current) {
                console.log(refIframe.current);
                refIframe.current.src = refIframe.current.src;
              }
            }}
            onClickUrl={() => {
              window.open('http://localhost:3333', '_blank');
            }}
          />
        </div>
      </div>
      <div>
        <iframe ref={refIframe} src="http://localhost:3333" />
      </div>
    </div>
  );
};

export default ViewPage;
