import React from "react";

import { Columns } from "react-bulma-components";

function ItemDetails({ item }) {
  const { item_no, title, description, game_type, num_cards, platform, media, condition } =
    item;
  return (
    <>
      <Columns>
        <Columns.Column size={3}>
          <Columns flexDirection="column">
            <Columns.Column>
              <b>Item #</b>
            </Columns.Column>
            <Columns.Column>
              <b>Title</b>
            </Columns.Column>
            {description && (
              <Columns.Column>
                <b>Description</b>
              </Columns.Column>
            )}
            <Columns.Column>
              <b>Game Type</b>
            </Columns.Column>
            {platform && (
              <Columns.Column>
                <b>Platform</b>
              </Columns.Column>
            )}
            {media && (
              <Columns.Column>
                <b>Media</b>
              </Columns.Column>
            )}
            {num_cards && (
              <Columns.Column>
                <b>Media</b>
              </Columns.Column>
            )}
            <Columns.Column>
              <b>Condition</b>
            </Columns.Column>
          </Columns>
        </Columns.Column>
        <Columns.Column>
          <Columns flexDirection="column">
            <Columns.Column>{item_no || "N/A"}</Columns.Column>
            <Columns.Column>{title}</Columns.Column>
            {description && <Columns.Column>{description}</Columns.Column>}
            <Columns.Column>{game_type}</Columns.Column>
            {platform && <Columns.Column>{platform}</Columns.Column>}
            {media && <Columns.Column>{media}</Columns.Column>}
            {num_cards && <Columns.Column>{num_cards}</Columns.Column>}
            <Columns.Column>{condition || "N/A"}</Columns.Column>
          </Columns>
        </Columns.Column>
      </Columns>
    </>
  );
}

export default ItemDetails;
