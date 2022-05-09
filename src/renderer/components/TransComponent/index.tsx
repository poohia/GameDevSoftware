import { useMemo } from 'react';
import i18n from 'translations/i18n';

type TransComponentProps = {
  id: string;
  values?: { key: string; value: string }[];
  defaultValue?: string;
};

const TransComponent = (props: TransComponentProps) => {
  const { id, defaultValue, values = [] } = props;
  const value = useMemo(() => {
    const v = i18n.t(id, { defaultValue });
    values.forEach((_value) => v.replace(_value.key, _value.value));
    return v;
  }, [props]);
  return <span>{value}</span>;
};

export default TransComponent;
