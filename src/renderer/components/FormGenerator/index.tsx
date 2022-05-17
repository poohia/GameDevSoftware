import useFormGenerator, { FormGeneratorProps } from './useFormGenerator';

const FormGenerator = (props: FormGeneratorProps) => {
  const Form = useFormGenerator(props);

  return <Form />;
};

export default FormGenerator;
