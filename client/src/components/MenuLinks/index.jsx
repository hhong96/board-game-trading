import React from "react";
import { Link } from "react-router-dom";
import { Button, Columns } from "react-bulma-components";

function MenuLinks() {
  return (
    <Columns flexDirection="column">
      <Columns.Column>
        <Button color="primary" renderAs={Link} to="/items/list">
          List Items
        </Button>
      </Columns.Column>
      <Columns.Column>
        <Button color="primary" renderAs={Link} to="/items">
          My Items
        </Button>
      </Columns.Column>
      <Columns.Column>
        <Button color="primary" renderAs={Link} to="/items/search">
          Search Items
        </Button>
      </Columns.Column>
      <Columns.Column>
        <Button color="primary" renderAs={Link} to="/trades">
          Trade History
        </Button>
      </Columns.Column>
    </Columns>
  );
}

export default MenuLinks;
