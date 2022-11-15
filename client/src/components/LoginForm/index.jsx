import { ErrorMessage, Field, Form as FormikForm, Formik } from "formik";
import React from "react";
import { Block, Heading, Button, Form, Columns } from "react-bulma-components";
import { Link, useNavigate } from "react-router-dom";
import BasicInput from "../utils/form/inputs/BasicInput";
import api from "../../utils/api";
import logger from "../../utils/logger";

export default function LoginForm() {
  const navigate = useNavigate();

  return (
    <Block>
      <Formik
        initialValues={{ emailOrNickname: "", password: "" }}
        validate={validateForm()}
        onSubmit={onSubmit(navigate)}
      >
        {({ isSubmitting, errors, touched }) => (
          <FormikForm>
            <Heading>Login</Heading>
            <Field
              type="text"
              name="emailOrNickname"
              as={BasicInput}
              label="Email/Nickname"
              disabled={isSubmitting}
              iconClass="fa-user"
              inErrorState={
                !!(errors.emailOrNickname && touched.emailOrNickname)
              }
            />
            <ErrorMessage
              name="emailOrNickname"
              component={Form.Help}
              color="danger"
            />
            <Field
              type="password"
              name="password"
              as={BasicInput}
              label="Password"
              disabled={isSubmitting}
              iconClass="fa-key"
              inErrorState={!!(errors.password && touched.password)}
            />
            <ErrorMessage
              name="password"
              component={Form.Help}
              color="danger"
            />

            <Columns vCentered>
              <Columns.Column>
                <Button type="submit" color="" disabled={isSubmitting}>
                  Login
                </Button>
              </Columns.Column>
              <Columns.Column size={3}>
                <Link to="/register">Register</Link>
              </Columns.Column>
            </Columns>
          </FormikForm>
        )}
      </Formik>
    </Block>
  );
}

function validateForm() {
  return ({ emailOrNickname, password }) => {
    const errors = {};
    if (!emailOrNickname) {
      errors.emailOrNickname = "Email or Nickname is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }

    return errors;
  };
}

function onSubmit(navigate) {
  return ({ emailOrNickname, password }, actions) => {
    actions.setSubmitting(true);

    api
      .login({ emailOrNickname, password })
      .then((loginResponse) => {
        actions.setSubmitting(false);
        if (loginResponse.email) {
          logger.debug("Login successful, navigating to menu");
          return navigate("/menu");
        }

        logger.debug(
          "Login returned successful status, but response format is unexpected"
        );
      })
      .catch((err) => {
        actions.setSubmitting(false);
        if (err.errors && err.errors.form) {
          actions.setFieldError("emailOrNickname", err.errors.form);
        } else if (err && err.errors) {
          actions.setErrors(err.errors);
        } else {
          logger.error("Failed to login because an unexpected error occurred", err);
        }
      });
  };
}

