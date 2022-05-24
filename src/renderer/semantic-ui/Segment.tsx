import { useContext } from 'react';
import { Segment as SegmentSemantic, SegmentProps } from 'semantic-ui-react';
import DarkModeContext from 'renderer/contexts/DarkModeContext';

const Segment = (props: SegmentProps) => {
  const { darkModeActived } = useContext(DarkModeContext);

  return (
    <SegmentSemantic {...props} inverted={darkModeActived}>
      {props.children}
    </SegmentSemantic>
  );
};

export default Segment;
