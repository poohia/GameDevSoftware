import { useContext, useMemo } from 'react';
import TranslationsContext from 'renderer/contexts/TranslationsContext';
import i18n from 'translations/i18n';

type TransComponentProps = {
  id: string;
  values?: { key: string; value: string }[];
  defaultValue?: string;
};

const TransComponent = (props: TransComponentProps) => {
  const { id, defaultValue = id, values = [] } = props;
  const { translations } = useContext(TranslationsContext);
  const value = useMemo(() => {
    if (id.includes('@t:')) {
      return (
        translations[id.replace('@t:', '')] ||
        `Translation not found ${id.replace('@t:', '')}`
      );
    }
    const v = i18n.t(id, { defaultValue });
    values.forEach((_value) => v.replace(_value.key, _value.value));
    return v;
  }, [props]);
  return <span>{value}</span>;
};

export default TransComponent;
