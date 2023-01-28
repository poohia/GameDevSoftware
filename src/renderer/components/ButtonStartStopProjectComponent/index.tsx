import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { Icon } from 'semantic-ui-react';
import { Button } from 'renderer/semantic-ui';
import i18n from 'translations/i18n';

type ButtonStartStopProjectComponentProps = {
  onCLickRefresh?: () => void;
  onClickUrl: () => void;
};
const ButtonStartStopProjectComponent: React.FC<
  ButtonStartStopProjectComponentProps
> = ({ onCLickRefresh, onClickUrl }) => {
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
    sendMessage('projected-started');
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
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <p style={{ margin: '0 10px' }}>
        <a
          href="http://localhost:3333"
          onClick={(e) => {
            e.preventDefault();
            onClickUrl();
          }}
        >
          http://localhost:3333
        </a>
      </p>
      {onCLickRefresh && (
        <Button
          icon
          labelPosition="right"
          color="blue"
          onClick={onCLickRefresh}
        >
          {i18n.t('module_application_home_project_refresh')}
          <Icon name="refresh" />
        </Button>
      )}
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
    </div>
  );
};

export default ButtonStartStopProjectComponent;
