import React from "react";
import { Box, Columns, Container } from "react-bulma-components";
import { Link } from "react-router-dom";
import SearchForm from "../components/SearchForm";
import ResponseTime from '../components/MenuStats/ResponseTime'


export default function Search() {
  return (
    <Container breakpoint="desktop">
      <Columns vCentered={true} style={{"minHeight": "100vh"}}>
        <Columns.Column>
          <Box style={{ width: "400px", margin: "auto" }}>
            <SearchForm />
          </Box>
        </Columns.Column>
      </Columns>
    </Container>
  );
}

export function SearchTable({results, type}) {
  return (
    <div>
      <table class="tradetable">
        <thead> Search: {type.header}
          <tr>
            <th>Item #</th>
            <th>Game Type</th>
            <th>Title</th>
            <th>Condition</th>
            <th>Description</th>
            <th>Response Time (days)</th>
            <th>Rank</th>
            <th>Distance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {results.result.map(res =>(
            <tr key={res.item_no}>
              <td>{res.item_no}</td>
              <td>{res.game_type}</td>
              <td>{res.title}</td>
              <td>{res.condition}</td>
              <td>{res.description}</td>
              <td>{<ResponseTime data={{avg_response_time: res.response}} />}</td>
              <td>{res.rank || 'None'}</td>
              <td>{res.distance || '0.0'}</td>
              <td><a href={`/items/${res.item_no}`}>Detail</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}