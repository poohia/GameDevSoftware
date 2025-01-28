import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Segment } from 'renderer/semantic-ui';
import { SoftwaresInfo } from 'types';

const HomeSoftwaresInfoComponent = () => {
  const [softwaresInfo, setSoftwareInfo] = useState<SoftwaresInfo>({
    git: null,
    node: null,
    npm: null,
    capacitor: null,
  });
  const { requestMessage } = useEvents();
  useEffect(() => {
    requestMessage('get-softwares-info', (arg) => {
      console.log('🚀 ~ requestMessage ~ arg:', arg);
      setSoftwareInfo(arg);
    });
  }, []);
  return (
    <Segment>
      {Object.keys(softwaresInfo).map((key) => (
        <p key={key}>
          {key}: <b>{softwaresInfo[key] || 'not installed'}</b>
        </p>
      ))}
    </Segment>
  );
};

export default HomeSoftwaresInfoComponent;
