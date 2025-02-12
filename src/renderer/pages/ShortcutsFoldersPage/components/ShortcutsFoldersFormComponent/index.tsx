import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TransComponent } from 'renderer/components';
import AssetsContext from 'renderer/contexts/AssetsContext';
import ConstantsContext from 'renderer/contexts/ConstantsContext';
import GameObjectContext from 'renderer/contexts/GameObjectContext';
import TranslationsContext from 'renderer/contexts/TranslationsContext';
import { Button } from 'renderer/semantic-ui';
import {
  Container,
  Dropdown,
  DropdownItemProps,
  Form,
  Grid,
  Header,
} from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ShortcutsFolder } from 'types';

type ShortcutsFoldersFormComponentProps = {
  defaultValue?: ShortcutsFolder;
  onSubmit: (values: any) => void;
};

const ShortcutsFoldersFormComponent: React.FC<
  ShortcutsFoldersFormComponentProps
> = (props) => {
  const { defaultValue, onSubmit } = props;

  /** Values */
  const [folderName, setFolderName] = useState<string>(
    defaultValue?.folderName || ''
  );
  const [translations, setTranslations] = useState<string[]>(
    defaultValue?.translations || []
  );
  const [assets, setAssets] = useState<string[]>(defaultValue?.assets || []);
  const [constants, setConstants] = useState<string[]>(
    defaultValue?.constants || []
  );
  const [gameObjects, setGameObjects] = useState<number[]>(
    defaultValue?.gameObjects || []
  );
  const [editable, setEditable] = useState<boolean>(() => {
    if (defaultValue?.editable !== undefined) {
      return defaultValue.editable;
    }
    return true;
  });
  const [deletable, setDeletable] = useState<boolean>(
    defaultValue?.deletable || true
  );
  /** */
  const [loading, setLoading] = useState<boolean>(false);

  /** Dropdowns */
  const [translationsDropdown, setTranslationsDropdowns] = useState<
    DropdownItemProps[]
  >([]);
  const [assetsDropdown, setAssetsDropdowns] = useState<DropdownItemProps[]>(
    []
  );
  const [constantsDropdown, setConstantsDropdowns] = useState<
    DropdownItemProps[]
  >([]);
  const [gameObjectsDropdown, setGameObjectsDropdowns] = useState<
    DropdownItemProps[]
  >([]);
  /** */

  const id = useMemo(() => defaultValue?.id, [defaultValue]);
  const disableForm = useMemo(
    () => (defaultValue ? editable === false : false),
    [defaultValue, editable]
  );

  /** Context */
  const { currentTranslations } = useContext(TranslationsContext);
  const { assets: currentAssets } = useContext(AssetsContext);
  const { constants: currentConstants } = useContext(ConstantsContext);
  const { gameObjects: currentGameObjects } = useContext(GameObjectContext);
  /** */

  const handleSubmit = useCallback(() => {
    onSubmit({
      id,
      folderName,
      translations,
      assets,
      constants,
      gameObjects,
      editable,
      deletable,
    });
    setLoading(true);
  }, [
    id,
    folderName,
    translations,
    assets,
    constants,
    gameObjects,
    editable,
    deletable,
  ]);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    setTranslationsDropdowns(
      currentTranslations.map((translation) => ({
        text: translation.key,
        value: translation.key,
      }))
    );
  }, [currentTranslations]);

  useEffect(() => {
    setAssetsDropdowns(
      currentAssets.map((asset) => ({
        text: asset.name,
        value: asset.name,
      }))
    );
  }, [currentAssets]);

  useEffect(() => {
    setConstantsDropdowns(
      currentConstants.map((constant) => ({
        text: constant.key,
        value: constant.key,
      }))
    );
  }, [currentConstants]);

  useEffect(() => {
    setGameObjectsDropdowns(
      currentGameObjects.map((gameObject) => ({
        text: gameObject._title,
        value: gameObject._id,
      }))
    );
  }, [gameObjects]);

  return (
    <Container fluid>
      <Grid className="game-dev-software-form-container">
        <Grid.Row>
          <Grid.Column>
            <Header as="h1">
              {defaultValue === undefined ? (
                <TransComponent id="module_shortcutsfolders_create" />
              ) : (
                <TransComponent id="module_shortcutsfolders_update" />
              )}
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Container fluid>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <Form.Input
                  label={i18n.t('module_shortcutsfolders_form_name')}
                  value={folderName}
                  onChange={(_: any, data: { value: string }) =>
                    setFolderName(data.value)
                  }
                  required
                  focus
                  disabled={disableForm}
                />
              </Form.Field>
              <Form.Field>
                <label>
                  <TransComponent id="form_input_modal_translations_title" />
                </label>
                <Dropdown
                  fluid
                  selection
                  search
                  defaultValue={translations}
                  options={translationsDropdown}
                  multiple
                  onChange={(_e, data) => {
                    setTranslations(data.value as string[]);
                  }}
                  clearable
                />
              </Form.Field>
              <Form.Field>
                <label>
                  <TransComponent id="form_input_modal_assets_title" />
                </label>
                <Dropdown
                  fluid
                  selection
                  search
                  defaultValue={assets}
                  options={assetsDropdown}
                  multiple
                  onChange={(_e, data) => {
                    setAssets(data.value as string[]);
                  }}
                  clearable
                />
              </Form.Field>
              <Form.Field>
                <label>
                  <TransComponent id="form_input_modal_constants_title" />
                </label>
                <Dropdown
                  fluid
                  selection
                  search
                  defaultValue={constants}
                  options={constantsDropdown}
                  multiple
                  onChange={(_e, data) => {
                    setConstants(data.value as string[]);
                  }}
                  clearable
                />
              </Form.Field>
              <Form.Field>
                <label>
                  <TransComponent id="module_gameobject_home_title" />
                </label>
                <Dropdown
                  fluid
                  selection
                  search
                  defaultValue={gameObjects}
                  options={gameObjectsDropdown}
                  multiple
                  onChange={(_e, data) => {
                    setGameObjects(data.value as number[]);
                  }}
                  clearable
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_editable')}
                  checked={editable}
                  onChange={() => setEditable(!editable)}
                />
              </Form.Field>
              <Form.Field>
                <Form.Checkbox
                  label={i18n.t('form_label_deletable')}
                  checked={deletable}
                  onChange={() => setDeletable(!deletable)}
                  disabled={disableForm}
                />
              </Form.Field>

              <Button type="submit" disabled={false} loading={loading}>
                {i18n.t('module_translation_form_field_submit')}
              </Button>
            </Form>
          </Container>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default ShortcutsFoldersFormComponent;
