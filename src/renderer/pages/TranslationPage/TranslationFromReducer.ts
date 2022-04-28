import { TranslationFormComponentProps } from './components/TranslationFormComponent';

type State = {
  translationForm: Omit<TranslationFormComponentProps, 'onSubmit'> | null;
};
type Action = {
  type: 'hide-form' | 'show-create-form' | 'show-update-form';
  data?: any;
};

export const defaultState: State = {
  translationForm: null,
};

export default (state: State, action: Action): State => {
  const { type, data } = action;
  switch (type) {
    case 'hide-form':
      return {
        translationForm: null,
      };
    case 'show-create-form':
      if (
        state.translationForm !== null &&
        state.translationForm.keyTranslation === undefined
      ) {
        return { translationForm: null };
      }
      const { languages } = data as { languages: string[] };
      return {
        translationForm: {
          values: languages.map((l) => ({ code: l, value: '' })),
        },
      };
    case 'show-update-form':
      const { keyTranslation, values } = data;
      if (
        state.translationForm !== null &&
        state.translationForm.keyTranslation === keyTranslation
      ) {
        return { translationForm: null };
      }
      return {
        translationForm: {
          keyTranslation,
          values,
        },
      };
    default:
      return state;
  }
};
