import { useEffect, useState } from 'react';
import useMessages from '../../useMessages';

type RouteInformationComponentProps = {
  refIframe: HTMLIFrameElement;
};
const RouteInformationComponent: React.FC<RouteInformationComponentProps> = ({
  refIframe,
}) => {
  const [pathInfo, setPathInfo] = useState<{
    route: string;
    sceneId?: number;
  }>();
  const { listenMessage } = useMessages(refIframe);

  useEffect(() => {
    listenMessage('changePath', (response) => {
      setPathInfo({
        route: response.data.route,
        sceneId: response.data.params?.sceneId,
      });
    });
  }, []);

  return (
    <div>
      {pathInfo && <div>Route: {pathInfo.route}</div>}
      {pathInfo?.sceneId && <div>SceneId: {pathInfo?.sceneId}</div>}
    </div>
  );
};

export default RouteInformationComponent;
