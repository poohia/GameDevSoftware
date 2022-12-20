import { useCallback, useEffect, useState } from 'react';

export type SpriteComponentProps = {
  width: number;
  timeBeetweenSprite: number;
  height?: number;
  image: string;
  maxFrame: number;
  loop?: boolean;
};

const SpriteComponent: React.FC<SpriteComponentProps> = (props) => {
  const {
    width,
    timeBeetweenSprite,
    height = width,
    image,
    maxFrame,
    loop,
  } = props;
  const [backgroundPosition, setBackgroundPosition] = useState<number>(0);
  const [animationIsFinish, setAnimationIsFinish] = useState<boolean>(false);
  const [timeout, setTImeout] = useState<any>(null);
  const [i, setI] = useState<number>(0);

  const startAnimation = useCallback(() => {
    const t = setInterval(() => {
      setI((_i) => {
        if (_i < maxFrame) {
          setBackgroundPosition((_backgroundPosition) => {
            return _backgroundPosition + width;
          });
          return _i + 1;
        }
        if (loop) {
          setBackgroundPosition(0);
          return 0;
        }
        clearInterval(timeout);
        setAnimationIsFinish(true);
        return 0;
      });
    }, timeBeetweenSprite);
    setTImeout(t);
  }, [props]);

  useEffect(() => {
    clearInterval(timeout);
    setBackgroundPosition(0);
    setAnimationIsFinish(false);
    startAnimation();
  }, [props]);

  if (animationIsFinish) return <></>;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: `url(${image})`,
        backgroundPosition: `${backgroundPosition * -1}px 0px`,
      }}
    ></div>
  );
};

export default SpriteComponent;
