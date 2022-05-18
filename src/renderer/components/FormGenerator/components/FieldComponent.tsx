import React, { ReactNode } from 'react';
import { Form, Segment } from 'semantic-ui-react';

export type FieldComponentProps = {
  keyValue: string;
  children: ReactNode;
  label: string;
  isObject?: boolean;
  required?: boolean;
  description?: string;
};
const FieldComponent: React.FunctionComponent<FieldComponentProps> = (
  props
) => {
  const {
    children,
    label,
    isObject,
    required = true,
    description,
    keyValue: key,
  } = props;

  if (isObject) {
    return (
      <Segment className="game-dev-software-module-application-params-identity-segment">
        <span className="game-dev-software-module-application-params-identity-segment-title">
          {label} {required && '*'}
        </span>
        {children}
        {description && (
          <p>
            <i>{description}</i>
          </p>
        )}
      </Segment>
    );
  }
  return (
    <Form.Field required={required}>
      <label htmlFor={key}>{label}</label>
      {children}
      {description && (
        <p>
          <i>{description}</i>
        </p>
      )}
    </Form.Field>
  );
};

export default FieldComponent;
