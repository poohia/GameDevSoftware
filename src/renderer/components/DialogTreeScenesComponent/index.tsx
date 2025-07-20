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
import { useEvents } from 'renderer/hooks';

import './index.scss';
import ScenesContext from 'renderer/contexts/ScenesContext';
import { SceneObject } from 'types';
import { Button } from 'renderer/semantic-ui';
import { Orientation } from 'react-d3-tree/lib/types/common';
import TransComponent from '../TransComponent';
import { toBlob, toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import GameObjectContext from 'renderer/contexts/GameObjectContext';

type DialogTreeScenesComponentComponentProps = {
  id: any;
  typeTarget?: 'scenes' | 'gameObjects';
  onClose: () => void;
  onValidate: (id: number) => void;
};

const DialogTreeScenesComponent: React.FC<
  DialogTreeScenesComponentComponentProps
> = (props) => {
  const { id, typeTarget = 'scenes', onValidate, onClose, ...rest } = props;

  const { requestMessage } = useEvents();

  const [firstScene, setFirstScene] = useState<number>();
  const { scenes } = useContext(ScenesContext);
  const { gameObjects } = useContext(GameObjectContext);
  const [finalId, setFinalId] = useState<number>(id);
  const [history, setHistory] = useState<number[]>([id]);
  const [data, setData] = useState<any>();
  const [orientation, setOrientation] = useState<Orientation>('vertical');
  const [translate, setTranslate] = useState<{ x: number; y: number }>();
  const [depth, setDepth] = useState(3);

  const currentScene = useMemo(() => {
    if (typeTarget === 'gameObjects') {
      return gameObjects.find((g) => g._id === finalId);
    }
    return scenes.find((s) => s._id === finalId);
  }, [finalId, typeTarget, scenes, gameObjects]);

  const containerRef = useRef<HTMLDivElement>(null);

  const buildTree = useCallback(
    (
      nodeObject: SceneObject,
      processingPath: Set<number> = new Set(),
      currentDepth: number = 0,
      linkDescription: string = ''
    ): any => {
      let childrenLinks: { node: SceneObject; linkDescription: string }[] = [];

      if (typeTarget === 'scenes') {
        (nodeObject._actions || []).forEach((action, index) => {
          const childScene = scenes.find(
            (s) => s._id === Number(action._scene.replace('@s:', ''))
          );
          if (childScene) {
            childrenLinks.push({
              node: childScene,
              linkDescription: `By action n°${index}`,
            });
          }
        });
      } else {
        const uniqueChildren = new Map<
          number,
          { node: SceneObject; linkDescription: string }
        >();
        Object.entries(nodeObject).forEach(([key, value]) => {
          const processItem = (item: any) => {
            if (typeof item === 'string' && item.startsWith('@go:')) {
              const id = Number(item.replace('@go:', ''));
              const childGo = gameObjects.find((go) => go._id === id);
              if (childGo && !uniqueChildren.has(id)) {
                // Évite les doublons
                uniqueChildren.set(id, {
                  node: childGo,
                  linkDescription: `By key: "${key}"`,
                });
              }
            }
          };
          if (Array.isArray(value)) value.forEach(processItem);
          else processItem(value);
        });
        childrenLinks = Array.from(uniqueChildren.values());
      }

      const hasChildren = childrenLinks.length > 0;
      let nodeName = nodeObject._title;
      if (currentDepth > 0 && linkDescription) {
        nodeName = `${nodeObject._title} (${linkDescription})`;
      }

      if (
        typeTarget === 'gameObjects' &&
        currentDepth >= depth &&
        hasChildren
      ) {
        return {
          name: `${nodeObject._title}`,
          id: nodeObject._id,
          attributes: { hasMoreChildren: true },
        };
      }

      return {
        name: nodeName,
        id: nodeObject._id,
        attributes: {},
        children: hasChildren
          ? childrenLinks.map(
              ({ node: childNode, linkDescription: childLinkDesc }) => {
                const nextProcessingPath = new Set(processingPath);
                nextProcessingPath.add(nodeObject._id);

                if (processingPath.has(childNode._id)) {
                  return {
                    name: `${childNode._title} [BOUCLE] (${childLinkDesc})`,
                    id: childNode._id,
                    attributes: { isLoop: true },
                  };
                }
                return buildTree(
                  childNode,
                  nextProcessingPath,
                  currentDepth + 1,
                  childLinkDesc
                );
              }
            )
          : undefined,
      };
    },
    [scenes, gameObjects, typeTarget, depth]
  );

  const center = useCallback(() => {
    if (!containerRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    const y = orientation === 'vertical' ? 50 : h / 2;
    const x = orientation === 'vertical' ? w / 2 : 150;
    setTranslate(undefined);
    setTimeout(() => setTranslate({ x, y }));
  }, [orientation]);

  const handleNodeClick = useCallback(
    (nodeDatum: any) => {
      if (finalId === nodeDatum.data.id || nodeDatum.data.attributes?.isLoop) {
        return;
      }
      setHistory((h) =>
        h[h.length - 1] !== nodeDatum.data.id ? [...h, nodeDatum.data.id] : h
      );
      setFinalId(nodeDatum.data.id);
    },
    [finalId]
  );

  const back = useCallback(() => {
    if (history.length <= 1) return;
    setHistory((h) => {
      const newHistory = [...h];
      newHistory.pop();
      setFinalId(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  }, [history]);

  const goFirstScene = useCallback(() => {
    if (!firstScene || finalId === firstScene) return;
    handleNodeClick({ data: { id: firstScene } });
  }, [firstScene, finalId, handleNodeClick]);

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

  useEffect(() => {
    if (!currentScene) {
      setData(undefined);
      return;
    }
    setData(buildTree(currentScene));
    if (containerRef.current) {
      center();
    }
  }, [currentScene, buildTree, center]);

  useEffect(() => {
    if (containerRef.current && data) center();
  }, [orientation, center, data]);

  useEffect(() => {
    if (typeTarget === 'scenes') {
      requestMessage('load-first-scene', (firstScene) => {
        setFirstScene(Number(firstScene.file.replace('.json', '')));
      });
    }
  }, [requestMessage, typeTarget]);

  return (
    <ModalComponent
      open
      onClose={onClose}
      onAccepted={() => onValidate(finalId)}
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
            onClick={() =>
              setOrientation((o) =>
                o === 'horizontal' ? 'vertical' : 'horizontal'
              )
            }
          >
            <TransComponent id="module_scene_tree_dialog_orienation" />
            <Icon name="redo" />
          </Button>
          <Button icon labelPosition="right" color="olive" onClick={center}>
            <TransComponent id="module_scene_tree_dialog_center" />
            <Icon name="compress" />
          </Button>
          {typeTarget === 'gameObjects' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                padding: '5px 10px',
                borderRadius: '5px',
              }}
            >
              <label
                htmlFor="depth-input"
                style={{ marginRight: '8px', fontWeight: 'bold' }}
              >
                Profondeur:
              </label>
              <input
                id="depth-input"
                type="number"
                value={depth}
                min={1}
                max={20}
                onChange={(e) => setDepth(Number(e.target.value))}
                style={{ width: '50px' }}
              />
            </div>
          )}
          {typeTarget === 'scenes' && (
            <Button
              icon
              labelPosition="right"
              color="brown"
              onClick={goFirstScene}
            >
              <TransComponent id="module_scene_tree_dialog_first_scene" />
              <Icon name="at" />
            </Button>
          )}
          <Button
            icon
            labelPosition="right"
            color="yellow"
            onClick={handleExportPng}
          >
            <TransComponent id="module_scene_tree_dialog_export" />
            <Icon name="image" />
          </Button>
          <Button
            icon
            labelPosition="left"
            secondary
            disabled={history.length <= 1}
            onClick={back}
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
          {data && translate && (
            <Tree
              data={data}
              orientation={orientation}
              translate={translate}
              onNodeClick={handleNodeClick}
              nodeSize={{ x: 320, y: 120 }}
              separation={{ siblings: 1.2, nonSiblings: 1.5 }}
              depthFactor={320}
              zoomable={true}
              draggable={true}
              collapsible={false}
              svgProps={{ style: { width: '100%', height: '100%' } }}
              nodeSvgShape={{
                shape: 'rect',
                shapeProps: {
                  width: 300,
                  height: 70,
                  x: -150,
                  y: -35,
                  rx: 5,
                  ry: 5,
                  strokeWidth: 1.5,
                  // @ts-ignore
                  stroke: (node) => {
                    if (node.data.attributes?.isLoop) return '#e57373';
                    if (node.data.attributes?.hasMoreChildren) return '#0288d1';
                    return '#607d8b';
                  },
                  // @ts-ignore
                  strokeDasharray: (node) =>
                    node.data.attributes?.hasMoreChildren ? '5 5' : 'none',
                  // @ts-ignore
                  fill: (node) =>
                    node.data.attributes?.isLoop ? '#ffcdd2' : 'white',
                },
              }}
              textLayout={{
                textAnchor: 'start',
                x: 10 - 150,
                y: 0,
                transform: undefined,
              }}
            />
          )}
        </div>
      </div>
    </ModalComponent>
  );
};

export default DialogTreeScenesComponent;
