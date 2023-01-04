import useFormGenerator from './useFormGenerator';

const FormGenerator = ({ type, form, defaultValues, onSubmit }: any) => {
  const Form = useFormGenerator({
    type,
    form,
    defaultValues,
    onSubmit,
  });

  return Form;
};

export default FormGenerator;
