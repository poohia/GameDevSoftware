export type State<T = any> = {
  show: boolean;
  key: string;
  value?: T;
};
export type Action<T = any> = {
  type: 'hide-form' | 'show-create-form' | 'show-update-form';
  data?: Omit<State<T>, 'show'>;
};

export const defaultState: State = {
  show: false,
  key: '',
};

const FormReducer = <T = string>(state: State<T>, action: Action): State<T> => {
  const { type, data } = action;
  const hideForm = () => {
    return {
      show: false,
      key: '',
    };
  };
  const showForm = () => {
    return {
      show: true,
      key: data ? data.key : '',
      value: data ? data.value : '',
    };
  };
  switch (type) {
    case 'hide-form':
      return hideForm();
    case 'show-update-form':
      if (state.value && state.key === data?.key) {
        return hideForm();
      }
      return showForm();
    case 'show-create-form':
      if (state.show && !state.value) {
        return hideForm();
      }
      return showForm();
    default:
      return state;
  }
};

export default FormReducer;
