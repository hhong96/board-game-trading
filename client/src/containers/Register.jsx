import React from 'react'
import { Container, Columns, Box } from 'react-bulma-components'
import RegisterForm from '../components/RegisterForm'

export default function Register() {
  return (
    <Container breakpoint="desktop">
      <Columns vCentered={true} style={{"minHeight": "100vh"}}>
      <Columns.Column>
        <Box style={{ width: "400px", margin: "auto" }}>
          <RegisterForm/>
        </Box>
      </Columns.Column>
      </Columns>
    </Container>
  )
}
