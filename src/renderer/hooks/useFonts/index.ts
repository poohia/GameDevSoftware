import { useEffect, useMemo } from 'react';
import { FontDataObject } from 'types';
import useEvents from '../useEvents';

const useFonts = () => {
  const { requestMessage } = useEvents();
  const style = useMemo(() => {
    const s = document.createElement('style');
    return s;
  }, []);

  useEffect(() => {
    requestMessage('load-fonts-data', (data: FontDataObject[]) => {
      let finalStyle = '';
      data.forEach(
        (font) =>
          (finalStyle += `
        @font-face {
          font-family: '${font.key}';
          src: url(${font.data}) format('${font.format}');
          font-weight: normal;
          font-style: normal;
        }
      `)
      );
      console.log('🚀 ~ file: index.ts:9 ~ requestMessage ~ data:', data);
      style.innerHTML = finalStyle;
    });
  }, []);

  useEffect(() => {
    document.head.appendChild(style);
  }, []);
};

export default useFonts;
