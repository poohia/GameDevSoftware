import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DropdownItemProps, Icon } from 'semantic-ui-react';
import Tree from 'react-d3-tree';
import ModalComponent from '../ModalComponent';
import { useEvents, useShortcutsFolders } from 'renderer/hooks';

import './index.scss';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { SceneObject } from 'types';
import { Button } from 'renderer/semantic-ui';
import { Orientation } from 'react-d3-tree/lib/types/common';
import TransComponent from '../TransComponent';

type DialogTreeScenesComponentComponentProps = {
  id: any;
  onClose: () => void;
  onValidate: (id: number) => void;
};

const DialogTreeScenesComponent: React.FC<
  DialogTreeScenesComponentComponentProps
> = (props) => {
  const { id, onValidate, onClose, ...rest } = props;

  const { shortcutsFolders } = useShortcutsFolders();
  const { requestMessage } = useEvents();

  const [shortcutsFoldersDropdown, setShortcutsFoldersDropdown] = useState<
    DropdownItemProps[]
  >([]);
  const [firstScene, setFirstScene] = useState<number>();
  const { scenes } = useContext(ScenesContext);
  const [finalId, setFinalId] = useState<number>(id);
  const [history, setHistory] = useState<number[]>([id]);
  const [values, setValues] = useState<number[]>([]);
  const [data, setData] = useState<any>();
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [translate, setTranslate] = useState<{ x: number; y: number }>();

  const currentScene = useMemo(
    () => scenes.find((s) => s._id === finalId),
    [finalId]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const buildTree = useCallback(
    (scene: SceneObject): any => {
      // On récupère les enfants directs via _actions
      const childScenes = scene._actions
        // Pour chaque action on cherche la scène cible
        .map((act) =>
          scenes.find((s) => s._id === Number(act._scene.replace('@s:', '')))
        )
        // Filtrer les valeurs null/undefined
        .filter((s): s is SceneObject => s !== undefined);

      return {
        name: `${scene._title} (${scene._id})`,
        id: scene._id,
        children:
          childScenes.length > 0
            ? childScenes.map((child) => buildTree(child))
            : undefined,
      };
    },
    [scenes]
  );

  const center = useCallback(() => {
    if (!containerRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    setTranslate(undefined);
    setTimeout(() => {
      setTranslate({ x: w / 2, y: 50 });
    });
  }, [containerRef]);

  const handleGenerateChilds = useCallback(() => {
    if (!currentScene) return;
    setData(buildTree(currentScene));
    center();
  }, [currentScene, buildTree]);

  const handleNodeClick = useCallback(
    (nodeDatum: any, evt: React.MouseEvent) => {
      if (finalId === nodeDatum.data.id) {
        return;
      }
      setData(undefined);
      setFinalId(nodeDatum.data.id);
      setHistory((h) => h.concat(nodeDatum.data.id));
      // ici tu peux faire ce que tu veux avec nodeDatum.id
    },
    [finalId]
  );

  const back = useCallback(() => {
    if (history.length === 1) return;
    setHistory((h) => {
      const lastId = h[h.length - 2];

      setFinalId(lastId);
      h.pop();
      return h;
    });
  }, [history]);

  const goFirstScene = useCallback(() => {
    if (!firstScene || finalId === firstScene) return;
    setFinalId(firstScene);
    setHistory((h) => h.concat(firstScene));
  }, [firstScene, finalId]);

  useEffect(() => {
    setShortcutsFoldersDropdown(
      shortcutsFolders.map((folder) => ({
        text: folder.folderName,
        value: folder.id,
      }))
    );
  }, [shortcutsFolders]);

  useEffect(() => {
    handleGenerateChilds();
  }, [finalId]);

  useEffect(() => {
    if (containerRef) {
      center();
    }
  }, [orientation, center]);

  useEffect(() => {
    requestMessage('load-first-scene', (firstScene) => {
      setFirstScene(Number(firstScene.file.replace('.json', '')));
    });
  }, []);

  return (
    <ModalComponent
      open
      onClose={onClose}
      onAccepted={() => {
        onValidate(finalId);
      }}
      title={`${currentScene?._title} (${currentScene?._id})`}
      size="fullscreen"
      {...rest}
    >
      <div className="dialogtreegoscenes-container">
        <div>
          <Button
            icon
            labelPosition="right"
            color="purple"
            onClick={() => {
              setOrientation((_o) => {
                if (_o === 'horizontal') {
                  return 'vertical';
                } else {
                  return 'horizontal';
                }
              });
            }}
          >
            {orientation === 'horizontal' ? (
              <TransComponent id="module_scene_tree_dialog_orienation_vertical"></TransComponent>
            ) : (
              <TransComponent id="module_scene_tree_dialog_orienation_horizontal"></TransComponent>
            )}
            <Icon name="redo" />
          </Button>
          <Button
            icon
            labelPosition="right"
            color="olive"
            onClick={() => {
              center();
            }}
          >
            <TransComponent id="module_scene_tree_dialog_center" />
            <Icon name="compress" />
          </Button>
          <Button
            icon
            labelPosition="right"
            color="brown"
            onClick={() => {
              goFirstScene();
            }}
          >
            <TransComponent id="module_scene_tree_dialog_first_scene" />
            <Icon name="at" />
          </Button>
          <Button
            icon
            labelPosition="left"
            secondary
            disabled={history.length <= 1}
            onClick={() => {
              back();
            }}
          >
            <TransComponent id="module_scene_tree_dialog_back" />
            <Icon name="angle left" />
          </Button>
        </div>
        <div ref={containerRef}>
          {data && translate && (
            <Tree
              data={data}
              orientation={orientation}
              nodeSize={{ x: 200, y: 100 }}
              translate={translate}
              collapsible={false}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>
      </div>
    </ModalComponent>
  );
};

export default DialogTreeScenesComponent;
