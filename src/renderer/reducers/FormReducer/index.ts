export type State<T = any> = {
  show: boolean;
  isEdit: boolean;
  key: string;
  value?: T;
};
export type Action<T = any> = {
  type: 'hide-form' | 'show-create-form' | 'show-update-form';
  data?: Pick<State<T>, 'key' | 'value'>;
};

export const defaultState: State = {
  show: false,
  isEdit: false,
  key: '',
};

const FormReducer = <T = string>(state: State<T>, action: Action): State<T> => {
  const { type, data } = action;
  const hideForm = () => {
    return {
      show: false,
      isEdit: false,
      key: '',
      value: undefined,
    };
  };
  const showForm = (isEdit = false) => {
    return {
      show: true,
      isEdit,
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
      return showForm(true);
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
