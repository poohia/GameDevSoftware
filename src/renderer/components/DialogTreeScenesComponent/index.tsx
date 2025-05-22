import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from 'semantic-ui-react';
import Tree from 'react-d3-tree';
import ModalComponent from '../ModalComponent';
import { useEvents, useShortcutsFolders } from 'renderer/hooks';

import './index.scss';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { SceneObject } from 'types';
import { Button } from 'renderer/semantic-ui';
import { Orientation } from 'react-d3-tree/lib/types/common';
import TransComponent from '../TransComponent';
import { toBlob, toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

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

  const [firstScene, setFirstScene] = useState<number>();
  const { scenes } = useContext(ScenesContext);
  const [finalId, setFinalId] = useState<number>(id);
  const [history, setHistory] = useState<number[]>([id]);
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
    if (!currentScene) return;
    setData(buildTree(currentScene));
    if (!containerRef.current) return;
    const { offsetWidth: w } = containerRef.current;
    setTranslate({ x: w / 2, y: 50 });
  }, [currentScene, buildTree]);

  // Fonction d'export PNG
  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    const svgNode = containerRef.current.querySelector<SVGSVGElement>('svg');
    if (!svgNode) {
      console.error('SVG element not found for PNG export.');
      return;
    }

    // Cloner le SVG pour ne pas affecter l'affichage et pour pouvoir le modifier
    const clonedSvgNode = svgNode.cloneNode(true) as SVGSVGElement;

    // Récupérer les dimensions réelles du contenu SVG
    const bbox = svgNode.getBBox();

    // Appliquer les dimensions et viewBox au clone pour s'assurer que tout est visible
    clonedSvgNode.setAttribute('width', `${bbox.width}`);
    clonedSvgNode.setAttribute('height', `${bbox.height}`);
    clonedSvgNode.setAttribute(
      'viewBox',
      `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    );

    // S'assurer que le namespace XML est présent pour une meilleure compatibilité
    if (!clonedSvgNode.getAttribute('xmlns')) {
      clonedSvgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // --- AJOUT DU FOND BLANC POUR SVG ---
    const backgroundRect = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    backgroundRect.setAttribute('x', `${bbox.x}`);
    backgroundRect.setAttribute('y', `${bbox.y}`);
    backgroundRect.setAttribute('width', `${bbox.width}`); // Ou '100%' si viewBox est bien 0 0 width height
    backgroundRect.setAttribute('height', `${bbox.height}`); // Ou '100%'
    backgroundRect.setAttribute('fill', 'white');
    // Insérer le rectangle en premier pour qu'il soit en arrière-plan
    clonedSvgNode.insertBefore(backgroundRect, clonedSvgNode.firstChild);
    // --- FIN DE L'AJOUT ---

    try {
      // Utiliser toPng directement sur le nœud SVG cloné et dimensionné
      // pixelRatio: 2 (ou plus) pour une meilleure résolution (fichier plus grand)
      const dataUrl = await toPng(clonedSvgNode, {
        cacheBust: true,
        pixelRatio: 2, // Double la résolution de base
        width: bbox.width, // Spécifier la largeur pour html-to-image
        height: bbox.height, // Spécifier la hauteur pour html-to-image
      });
      saveAs(dataUrl, `${currentScene?._title || 'tree'}.png`);
    } catch (e) {
      console.error('Export PNG failed:', e);
      // Tentative de fallback avec l'ancienne méthode si la nouvelle échoue
      try {
        console.warn('Retrying PNG export with alternative method...');
        const xml = new XMLSerializer().serializeToString(clonedSvgNode);
        const svgDataUrl =
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        const blob = await toBlob(svgDataUrl, {
          cacheBust: true,
          pixelRatio: 2,
        });
        if (blob)
          saveAs(blob, `${currentScene?._title || 'tree'}_fallback.png`);
      } catch (e2) {
        console.error('Fallback PNG Export failed:', e2);
      }
    }
  }, [currentScene]);

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
            labelPosition="right"
            color="yellow"
            onClick={() => {
              handleExportPng();
            }}
          >
            <TransComponent id="module_scene_tree_dialog_export" />
            <Icon name="image" />
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
