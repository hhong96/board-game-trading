import React from "react";
import { Box, Columns, Container } from "react-bulma-components";
import { useNavigate } from "react-router";
import LoginForm from "../components/LoginForm";
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate()
  if (api.getSession()) {
    return navigate('/menu')
  }

  return (
    <Container breakpoint="desktop">
      <Columns vCentered={true} style={{"minHeight": "100vh"}}>
      <Columns.Column>
        <Box style={{ width: "400px", margin: "auto" }}>
          <LoginForm />
        </Box>
      </Columns.Column>
      </Columns>
    </Container>
  );
}
