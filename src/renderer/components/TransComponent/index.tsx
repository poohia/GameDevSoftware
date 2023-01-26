import { useContext, useMemo } from 'react';
import TranslationsContext from 'renderer/contexts/TranslationsContext';
import i18n from 'translations/i18n';

type TransComponentProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  id: string;
  values?: { key: string; value: string }[];
  defaultValue?: string;
};

const TransComponent = (props: TransComponentProps) => {
  const { id, defaultValue = id, values = [], ...rest } = props;
  const { translations, gameLocale } = useContext(TranslationsContext);

  const value = useMemo(() => {
    if (!id) return 'Translation id not found';
    if (id.startsWith('@t:')) {
      return (
        translations[gameLocale].find(
          (translation) => translation.key === id.replace('@t:', '')
        )?.text || `Translation not found ${id.replace('@t:', '')}`
      );
    }
    let v = i18n.t(id, { defaultValue });
    values.forEach(
      (_value) => (v = v.replace(`{${_value.key}}`, _value.value))
    );
    return v;
  }, [props]);
  return <span {...rest}>{value}</span>;
};

export default TransComponent;
