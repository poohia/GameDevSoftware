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
  // const [values, setValues] = useState<number[]>([]); // Semble inutilisé
  const [data, setData] = useState<any>();
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [translate, setTranslate] = useState<{ x: number; y: number }>();

  const currentScene = useMemo(
    () => scenes.find((s) => s._id === finalId),
    [finalId, scenes] // Ajout de scenes comme dépendance
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const buildTree = useCallback(
    (scene: SceneObject, processingPath: Set<number> = new Set()): any => {
      // On récupère les enfants directs via _actions
      const childScenes = scene._actions
        .map((act) =>
          scenes.find((s) => s._id === Number(act._scene.replace('@s:', '')))
        )
        .filter((s): s is SceneObject => s !== undefined);

      // Créer une nouvelle copie du chemin pour cette branche et y ajouter la scène actuelle
      // Important : on vérifie si le *child* est dans processingPath
      // processingPath contient les ancêtres de `scene`

      return {
        name: `${scene._title} (${scene._id})`,
        id: scene._id,
        attributes: {
          // Pour stocker des métadonnées
          title: scene._title,
        },
        children:
          childScenes.length > 0
            ? childScenes
                .map((childScene) => {
                  if (processingPath.has(childScene._id)) {
                    // Boucle détectée !
                    return {
                      name: `${childScene._title} (${childScene._id}) - [LOOP DETECTED]`,
                      id: childScene._id,
                      attributes: { isLoop: true, title: childScene._title },
                      // Pas d'enfants pour ce nœud pour casser la boucle
                    };
                  }
                  // Ajouter l'ID de la scène *actuelle* au chemin pour les appels récursifs de ses enfants
                  const nextProcessingPath = new Set(processingPath);
                  nextProcessingPath.add(scene._id);
                  return buildTree(childScene, nextProcessingPath);
                })
                .filter(Boolean) // Au cas où une des branches retourne null/undefined
            : undefined,
      };
    },
    [scenes] // scenes est la seule dépendance externe de buildTree
  );

  const center = useCallback(() => {
    if (!containerRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    const y = orientation === 'vertical' ? 50 : h / 2;
    const x = orientation === 'vertical' ? w / 2 : 50;

    setTranslate(undefined); // Force le re-render
    setTimeout(() => {
      setTranslate({ x, y });
    });
  }, [orientation, containerRef]); // containerRef est stable, pas besoin de le mettre en dépendance

  const handleNodeClick = useCallback(
    (nodeDatum: any, evt: React.MouseEvent) => {
      if (finalId === nodeDatum.data.id || nodeDatum.data.attributes?.isLoop) {
        // Ne pas naviguer si on clique sur le même noeud ou un noeud marquant une boucle
        return;
      }
      //setData(undefined); // Sera géré par le useEffect qui dépend de finalId/currentScene
      setHistory((h) => {
        if (h[h.length - 1] !== nodeDatum.data.id) {
          // Evite les doublons si clics rapides
          return [...h, nodeDatum.data.id];
        }
        return h;
      });
      setFinalId(nodeDatum.data.id);
    },
    [finalId]
  );

  const back = useCallback(() => {
    if (history.length <= 1) return;
    setHistory((h) => {
      const newHistory = [...h];
      newHistory.pop();
      const lastId = newHistory[newHistory.length - 1];
      setFinalId(lastId);
      return newHistory;
    });
  }, [history]);

  const goFirstScene = useCallback(() => {
    if (!firstScene || finalId === firstScene) return;
    // @ts-ignore
    handleNodeClick({ data: { id: firstScene } });
  }, [firstScene, finalId, handleNodeClick]);

  useEffect(() => {
    if (!currentScene) {
      setData(undefined); // Si pas de scène courante, vider l'arbre
      return;
    }
    // L'appel initial à buildTree se fait avec un Set vide pour processingPath
    setData(buildTree(currentScene, new Set()));
    if (containerRef.current) {
      // Centrer après la génération
      center();
    }
  }, [currentScene, buildTree, center]); // buildTree et center sont useCallback

  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    const svgNode = containerRef.current.querySelector<SVGSVGElement>('svg');
    if (!svgNode) {
      console.error('SVG element not found for PNG export.');
      return;
    }
    const clonedSvgNode = svgNode.cloneNode(true) as SVGSVGElement;
    const bbox = svgNode.getBBox();
    clonedSvgNode.setAttribute('width', `${bbox.width}`);
    clonedSvgNode.setAttribute('height', `${bbox.height}`);
    clonedSvgNode.setAttribute(
      'viewBox',
      `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    );
    if (!clonedSvgNode.getAttribute('xmlns')) {
      clonedSvgNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    const backgroundRect = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    backgroundRect.setAttribute('x', `${bbox.x}`);
    backgroundRect.setAttribute('y', `${bbox.y}`);
    backgroundRect.setAttribute('width', `${bbox.width}`);
    backgroundRect.setAttribute('height', `${bbox.height}`);
    backgroundRect.setAttribute('fill', 'white');
    clonedSvgNode.insertBefore(backgroundRect, clonedSvgNode.firstChild);

    try {
      const dataUrl = await toPng(clonedSvgNode, {
        cacheBust: true,
        pixelRatio: 2,
        width: bbox.width,
        height: bbox.height,
        // backgroundColor: 'white', // Redondant si le rect est dans le SVG source
      });
      saveAs(dataUrl, `${currentScene?._title || 'tree'}.png`);
    } catch (e) {
      console.error('Export PNG failed:', e);
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

  // Ce useEffect s'occupe de regénérer l'arbre lorsque finalId change (donc currentScene change).
  // Le useEffect qui dépend de [currentScene, buildTree, center] fait déjà le travail.
  // Donc celui-ci peut être redondant.
  // useEffect(() => {
  //   handleGenerateChilds(); // Appelé quand finalId change
  // }, [finalId, handleGenerateChilds]);

  useEffect(() => {
    // Centrer si l'orientation change et que l'arbre est déjà affiché
    if (containerRef.current && data) {
      center();
    }
  }, [orientation, center, data]); // data ici pour s'assurer qu'il y a qqch à centrer

  useEffect(() => {
    requestMessage('load-first-scene', (firstScene) => {
      setFirstScene(Number(firstScene.file.replace('.json', '')));
    });
  }, [requestMessage]); // requestMessage est une fonction de hook, elle devrait être stable

  return (
    <ModalComponent
      open
      onClose={onClose}
      onAccepted={() => {
        onValidate(finalId);
      }}
      title={`${currentScene?._title || 'Chargement...'} (${
        currentScene?._id || 'N/A'
      })`}
      size="fullscreen"
      {...rest}
    >
      <div className="dialogtreegoscenes-container">
        <div className="dialogtreegoscenes-toolbar">
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
            <TransComponent id="module_scene_tree_dialog_orienation"></TransComponent>
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
        <div
          className="dialogtreegoscenes-treearea"
          ref={containerRef}
          style={{ backgroundColor: 'white' }}
        >
          {data && translate ? (
            <Tree
              data={data}
              orientation={orientation}
              nodeSize={{ x: 250, y: 120 }} // Augmenté un peu pour les noms plus longs
              translate={translate}
              collapsible={false}
              onNodeClick={handleNodeClick}
              zoomable={true}
              draggable={true}
              separation={{ siblings: 1.2, nonSiblings: 1.8 }}
              depthFactor={200}
              svgProps={{
                style: { width: '100%', height: '100%' },
              }}
              // Vous pouvez personnaliser l'apparence des nœuds "loop" ici
              // en utilisant renderCustomNodeElement ou en modifiant nodeSvgShape
              // Exemple pour changer la couleur des nœuds de boucle :
              nodeSvgShape={{
                shape: 'rect',
                shapeProps: {
                  width: 230,
                  height: 70,
                  x: -115,
                  y: -35,
                  rx: 5,
                  ry: 5,
                  strokeWidth: 1,
                  // @ts-ignore nodeDatum n'est pas typé ici par défaut
                  stroke: (nodeDatum) =>
                    nodeDatum.data.attributes?.isLoop ? 'red' : '#607d8b',
                  // @ts-ignore
                  fill: (nodeDatum) =>
                    nodeDatum.data.attributes?.isLoop ? '#ffdddd' : 'white',
                },
              }}
              textLayout={{
                textAnchor: 'start',
                x: 15 - 115, // x initial + x du rect
                y: 0, // Ajustement vertical si nécessaire
                transform: undefined,
              }}
            />
          ) : (
            <div>
              <TransComponent id="module_scene_tree_dialog_loading_tree" />
            </div>
          )}
        </div>
      </div>
    </ModalComponent>
  );
};

export default DialogTreeScenesComponent;
