import React from "react";
import { Button, Columns } from "react-bulma-components";
import { Link } from 'react-router-dom'
import ResponseTime from "../MenuStats/ResponseTime";
import UserDistance from "./UserDistance";

function ItemOwnerDetails({ item, itemNo }) {
  const {
    can_respond_to_trade,
    item_is_available,
    other_user_profile: { fullname, location },
    avg_response_time,
    rank,
    distance,
  } = item;

  return (
    <>
      <Columns>
        <Columns.Column size={3}>
          <Columns flexDirection="column">
            <Columns.Column>
              <b>Offered By</b>
            </Columns.Column>
            <Columns.Column>Location</Columns.Column>
            <Columns.Column>Response Time</Columns.Column>
            <Columns.Column>Rank</Columns.Column>
            <Columns.Column>Distance</Columns.Column>
          </Columns>
        </Columns.Column>
        <Columns.Column>
          <Columns flexDirection="column">
            <Columns.Column>{fullname}</Columns.Column>
            <Columns.Column>{location || "\u00A0"}</Columns.Column>
            <Columns.Column>
              <ResponseTime data={{ avg_response_time }} />
            </Columns.Column>
            <Columns.Column>{rank}</Columns.Column>
            <Columns.Column>
              <UserDistance distance={distance} />
            </Columns.Column>
            <Columns.Column>{}</Columns.Column>
          </Columns>
        </Columns.Column>
      </Columns>
      {(item_is_available && can_respond_to_trade && (
        <Button color="primary" renderAs={Link} to={`/items/${itemNo}/trade/new`}>Propose Trade</Button>
      )) ||
        null}
    </>
  );
}

export default ItemOwnerDetails;
