import React from "react";
import { Form, Icon } from "react-bulma-components";

const BasicInput = ({
  name,
  value,
  label,
  type,
  onChange,
  onBlur,
  disabled,
  iconClass,
  inErrorState,
}) => {
  return (
    <Form.Field>
      <Form.Label>{label}</Form.Label>
      <Form.Control>
        <Form.Input
          type={type}
          color={inErrorState ? "danger" : "text"}
          value={value}
          name={name}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
        />
        {iconClass ? (
          <Icon align="left" size="small">
            <i className={`fas ${iconClass}`} />
          </Icon>
        ) : null}
      </Form.Control>
    </Form.Field>
  );
};

export default BasicInput;
