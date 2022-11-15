import React from "react";

import { Box, Columns, Heading } from "react-bulma-components";
import ResponseTime from "./ResponseTime";
import UnacceptedTrades from "./UnacceptedTrades";

function MenuStatsPanel({ data }) {
  return (
      <Columns flexDirection="column">
        <Columns.Column>
          <Heading spaced size={4}>
            Unaccepted trades
          </Heading>
          <Heading subtitle size={5}>
            <UnacceptedTrades data={data} />
          </Heading>
        </Columns.Column>
        <Columns.Column>
          <Heading renderAs="p" spaced size={4}>
            Response time
          </Heading>
          <Heading subtitle size={5}>
            <ResponseTime data={data} />
          </Heading>
        </Columns.Column>
        <Columns.Column>
          <Heading spaced size={4}>
            My rank
          </Heading>
          <Heading subtitle size={5}>
            {data.rank}
          </Heading>
        </Columns.Column>
      </Columns>
  );
}

export default MenuStatsPanel;
