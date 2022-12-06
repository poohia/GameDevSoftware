import React, { ReactNode } from 'react';
import { Form } from 'semantic-ui-react';
import { Segment } from 'renderer/semantic-ui';

export type FieldComponentProps = {
  keyValue?: string;
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
        <span className="game-dev-software-module-application-params-identity-segment-title game-dev-software-module-application-params-identity-segment-title-label-form">
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
