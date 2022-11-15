import React from "react";
import { useParams } from "react-router";
import { Message, Box, Heading, Columns } from "react-bulma-components";
import { useQuery } from "react-query";
import api from "../utils/api";
import ItemDetails from "../components/ItemDetails/ItemDetails";
import ItemOwnerDetails from "../components/ItemDetails/ItemOwnerDetails";

export default function ViewItem() {
  const { itemNo } = useParams();
  const {
    isLoading,
    error,
    data: item,
  } = useQuery(["item", itemNo], () => api.getBasicItemInfo(itemNo), {
    retry: false,
  });

  if (isLoading) {
    return "Loading Item";
  } else if (error) {
    return (
      <Message color="danger">
        <Message.Header>
          <span>Item loading failed!</span>
        </Message.Header>
        <Message.Body>
          An error occurred while loading item data: {error.message}
        </Message.Body>
      </Message>
    );
  }

  let counterpartyDetailsComponent = null;
  if (item.other_user_profile) {
    counterpartyDetailsComponent = <ItemOwnerDetails item={item} itemNo={itemNo} />;
  }

  return (
    <Box shadowless flexDirection="column">
      <Heading>Item Details</Heading>
      <Columns>
        <Columns.Column>
          <ItemDetails item={item} />
        </Columns.Column>
        <Columns.Column>{counterpartyDetailsComponent}</Columns.Column>
      </Columns>
    </Box>
  );
}
