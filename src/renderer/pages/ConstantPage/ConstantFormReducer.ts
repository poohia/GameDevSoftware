import { ConstantValue } from 'types';

type State = {
  show: boolean;
  key: string;
  value?: ConstantValue;
};
type Action = {
  type: 'hide-form' | 'show-create-form' | 'show-update-form';
  data?: Omit<State, 'show'>;
};

export const defaultState: State = {
  show: false,
  key: '',
};

export default (state: State, action: Action): State => {
  const { type, data } = action;
  switch (type) {
    case 'hide-form':
      return {
        ...state,
        show: false,
      };
    case 'show-update-form':
      if (state.value && state.key === data?.key) {
        return {
          show: false,
          key: '',
        };
      }
    case 'show-create-form':
      return {
        show: true,
        key: data ? data.key : '',
        value: data ? data.value : '',
      };
    default:
      return state;
  }
};
