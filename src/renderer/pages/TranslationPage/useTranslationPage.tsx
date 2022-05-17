import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { useDatabase, useEvents } from 'renderer/hooks';
import { TranslationObject } from 'types';
import TranslationFromReducer, { defaultState } from './TranslationFromReducer';
import GameModuleContext from 'renderer/contexts/GameModuleContext';
import TranslationsContext from 'renderer/contexts/TranslationsContext';

const useTranslationPage = () => {
  const { module } = useContext(GameModuleContext);
  const { gameLocale: locale, setGameLocale } = useContext(TranslationsContext);
  const isModuleView = useMemo(() => !!module, [module]);
  /**  */
  const [languages, setLanguages] = useState<string[]>([]);
  const [translations, setTranslations] = useState<TranslationObject>({});
  // const [locale, setLocale] = useState<string>(i18n.locale);
  /**  */
  const { setItem } = useDatabase();
  const { once, sendMessage, requestMessage } = useEvents();
  const [state, dispatch] = useReducer(TranslationFromReducer, defaultState);
  const { translationForm } = state;
  const currentTranslations = useMemo(() => {
    if (translations === undefined || Object.keys(translations).length === 0) {
      return {};
    }
    return translations[locale] || translations[Object.keys(translations)[0]];
  }, [translations, locale]);
  /** */

  const appendLocale = useCallback(
    (locale: string) => {
      setTranslations((_translations: any) => {
        _translations[locale] = {};
        Object.keys(currentTranslations).forEach((key) => {
          _translations[locale][key] = '';
        });
        return JSON.parse(JSON.stringify(_translations));
      });
      dispatch({ type: 'hide-form' });
      sendMessage('set-languages', [...languages, locale]);
    },
    [currentTranslations, languages]
  );

  const removeLocale = useCallback(
    (language: string) => {
      setLanguages((_languages) => {
        _languages = JSON.parse(
          JSON.stringify(_languages.filter((l) => l !== language))
        );
        sendMessage('remove-language', { language, languages: _languages });
        setGameLocale(_languages[0]);
        dispatch({ type: 'hide-form' });
        return _languages;
      });
    },
    [languages]
  );

  const deleteTranslation = useCallback((key: string) => {
    setTranslations((_translations: any) => {
      Object.keys(_translations).forEach((code: string) => {
        delete _translations[code][key];
      });
      return JSON.parse(JSON.stringify(_translations));
    });
    dispatch({ type: 'hide-form' });
  }, []);

  const createTranslationKey = useCallback(() => {
    dispatch({ type: 'show-create-form', data: { languages } });
  }, [languages]);

  const updateTranslationKey = useCallback(
    (key: string) => {
      const formatValues = () => {
        const values: { code: string; value: string }[] = [];

        Object.keys(translations).forEach((arrKey) => {
          values.push({ code: arrKey, value: translations[arrKey][key] });
        });
        return values;
      };
      dispatch({
        type: 'show-update-form',
        data: {
          keyTranslation: key,
          values: formatValues(),
        },
      });
    },
    [translations]
  );

  const appendTranslation = useCallback(
    (createTranslations: TranslationObject) => {
      setTranslations((_translations) => {
        Object.keys(createTranslations).forEach((key) => {
          _translations[key] = {
            ..._translations[key],
            ...createTranslations[key],
          };
        });
        dispatch({ type: 'hide-form' });
        return JSON.parse(JSON.stringify(_translations));
      });
    },
    []
  );

  const changeGameCurrentLocale = useCallback((l: string) => {
    setItem('game-locale', l);
    setGameLocale(l);
  }, []);

  const init = useCallback(() => {
    once('languages-authorized', (args: { code: string }[]) => {
      setLanguages(args.map((arg) => arg.code));
    });
    const unSub = requestMessage('load-translations', (args) => {
      setTranslations(args);
    });
    return () => {
      unSub();
    };
  }, []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (translations) {
      sendMessage('save-translations', translations);
    }
  }, [translations]);

  useEffect(() => {
    dispatch({ type: 'hide-form' });
  }, [locale]);

  return {
    locale,
    currentTranslations,
    languages,
    translationForm,
    isModuleView,
    appendLocale,
    deleteTranslation,
    removeLocale,
    createTranslationKey,
    appendTranslation,
    updateTranslationKey,
    changeGameCurrentLocale,
  };
};

export default useTranslationPage;
