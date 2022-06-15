import {
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TransComponent } from 'renderer/components';
import { Form, Grid } from 'semantic-ui-react';
import { useEvents } from 'renderer/hooks';
import ScenesContext from 'renderer/contexts/ScenesContext';

const DropdownFirstScene = () => {
  const [firstScene, setFirstScene] = useState<number>();
  const { scenes } = useContext(ScenesContext);
  const options = useMemo(
    () =>
      scenes.map((scene) => ({
        key: scene._id,
        text: `Id: ${scene._id}`,
        value: scene._id,
      })),
    [scenes]
  );
  const { requestMessage, sendMessage } = useEvents();

  const handleChangeFirstScene = useCallback(
    (
      _: SyntheticEvent,
      data: {
        value: number;
      }
    ) => {
      setFirstScene(data.value);
      sendMessage('set-first-scene', data.value);
    },
    []
  );

  useEffect(() => {
    requestMessage('load-first-scene', (firstScene) => {
      setFirstScene(Number(firstScene.file.replace('.json', '')));
    });
  }, []);

  return (
    <Grid.Column>
      <Form>
        <Form.Field>
          <Form.Dropdown
            fluid
            selection
            label={
              <TransComponent id="module_application_home_global_modules_title" />
            }
            required
            value={firstScene}
            options={options}
            onChange={handleChangeFirstScene}
          />
        </Form.Field>
      </Form>
    </Grid.Column>
  );
};

export default DropdownFirstScene;
