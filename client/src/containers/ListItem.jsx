import React from 'react'
import { Container, Columns, Box } from 'react-bulma-components'
import ListItem from '../components/ListItem'

export default function List() {
  return (
    <Container breakpoint="desktop">
      <Columns vCentered={true} style={{"minHeight": "100vh"}}>
      <Columns.Column>
        <Box style={{ width: "400px", margin: "auto" }}>
          <ListItem/>
        </Box>
      </Columns.Column>
      </Columns>
    </Container>
  )
}

export function SuccessMessageObject({message}) {
  return (
    <div>
      <h>{message}</h>
    </div>
  )
}
