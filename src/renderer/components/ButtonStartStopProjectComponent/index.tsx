import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';

const ButtonStartStopProjectComponent = () => {
  const [projectStarted, setProjectStarted] = useState<boolean>(false);
  const [loadingToggleProject, setLoadingToggleProject] =
    useState<boolean>(false);
  const { sendMessage, on } = useEvents();

  const toggleProject = useCallback(() => {
    if (loadingToggleProject) return;
    sendMessage('toggle-project');
    setLoadingToggleProject(true);
  }, [loadingToggleProject, sendMessage]);

  useEffect(() => {
    on('projected-started', (arg: boolean) => {
      setProjectStarted(arg);
      setLoadingToggleProject(false);
    });
  }, []);

  if (!projectStarted) {
    return (
      <Button
        icon
        labelPosition="right"
        color="green"
        onClick={toggleProject}
        loading={loadingToggleProject}
      >
        {i18n.t('module_application_home_project_start')}
        <Icon name="play" />
      </Button>
    );
  }

  return (
    <>
      <Button
        icon
        labelPosition="right"
        color="red"
        onClick={toggleProject}
        loading={loadingToggleProject}
      >
        {i18n.t('module_application_home_project_stop')}
        <Icon name="stop" />
      </Button>
      <p>
        <a href="http://localhost:3000" target={'_blank'}>
          http://localhost:3000
        </a>
      </p>
    </>
  );
};

export default ButtonStartStopProjectComponent;
