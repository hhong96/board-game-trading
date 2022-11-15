import { Form, Formik, Field, ErrorMessage } from "formik";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Block,
  Heading,
  Columns,
  Button,
  Form as BulmaForm,
} from "react-bulma-components";
import BasicInput from "../utils/form/inputs/BasicInput";
import api from "../../utils/api";
import logger from "../../utils/logger";

const initialFormValues = {
  email: "",
  nickname: "",
  firstName: "",
  lastName: "",
  password: "",
  postalCode: "",
};

function RegisterForm() {
  const navigate = useNavigate();
  return (
    <Block>
      <Formik
        initialValues={initialFormValues}
        validate={validateForm()}
        onSubmit={handleSubmit(navigate)}
      >
        {({ isSubmitting, errors, touched }) => {
          logger.info("submitting", isSubmitting);
          return (
            <Form>
              <Heading>Register</Heading>
              <Field
                type="text"
                name="email"
                as={BasicInput}
                label="Email"
                disabled={isSubmitting}
                iconClass="fa-user"
                inErrorState={!!(errors.email && touched.email)}
              />
              <ErrorMessage
                name="email"
                component={BulmaForm.Help}
                color="danger"
              />
              <Field
                type="text"
                name="nickname"
                as={BasicInput}
                label="Nickname"
                disabled={isSubmitting}
                iconClass="fa-user"
                inErrorState={!!(errors.nickname && touched.nickname)}
              />
              <ErrorMessage
                name="nickname"
                component={BulmaForm.Help}
                color="danger"
              />
              <Field
                type="text"
                name="firstName"
                as={BasicInput}
                label="First Name"
                disabled={isSubmitting}
                iconClass="fa-user"
                inErrorState={!!(errors.firstName && touched.firstName)}
              />
              <ErrorMessage
                name="firstName"
                component={BulmaForm.Help}
                color="danger"
              />
              <Field
                type="text"
                name="lastName"
                as={BasicInput}
                label="Last Name"
                disabled={isSubmitting}
                iconClass="fa-user"
                inErrorState={!!(errors.lastName && touched.lastName)}
              />
              <ErrorMessage
                name="lastName"
                component={BulmaForm.Help}
                color="danger"
              />
              <Field
                type="string"
                name="postalCode"
                as={BasicInput}
                label="Postal Code"
                disabled={isSubmitting}
                inErrorState={!!(errors.postalCode && touched.postalCode)}
              />
              <ErrorMessage
                name="postalCode"
                component={BulmaForm.Help}
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
                component={BulmaForm.Help}
                color="danger"
              />
              <Columns vCentered>
                <Columns.Column>
                  <Button type="submit" color="" disabled={isSubmitting}>
                    Register
                  </Button>
                </Columns.Column>
                <Columns.Column size={3}>
                  <Link to="/login">Login</Link>
                </Columns.Column>
              </Columns>
            </Form>
          );
        }}
      </Formik>
    </Block>
  );
}

function validateForm() {
  return (values) => {
    const formNames = [
      "email",
      "password",
      "firstName",
      "lastName",
      "nickname",
      "postalCode",
    ];
    const errors = formNames.reduce((acc, name) => {
      if (!(values[name] && values[name].trim())) {
        acc[name] = "Field is required";
      }

      return acc;
    }, {});


    return errors;
  };
}

function handleSubmit(navigate) {
  return (values, actions) => {
    console.log("foo");
    logger.info("Starting registration process");
    actions.setSubmitting(true);
    api
      .register(values)
      .then((registerSuccess) => {
        actions.setSubmitting(false);
        if (registerSuccess.email) {
          logger.info("Register succeeded.  Navigating to menu");
          return navigate("/menu");
        }

        logger.debug(
          "Register succeeded, but the response was formatted incorrectly"
        );
      })
      .catch((err) => {
        actions.setSubmitting(false);
        if (err.errors && err.errors.form) {
          actions.setFieldError("email", err.errors.form);
        } else if (err && err.errors) {
          actions.setErrors(err.errors);
        } else {
          logger.error(
            "Failed to login because an unexpected error occurred",
            err
          );
        }
      });
  };
}

export default RegisterForm;
