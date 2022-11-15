// import { Form, Formik, Field, ErrorMessage } from "formik";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../utils/api";
import logger from "../../utils/logger";
import { useQuery } from "react-query";
import {
  Box,
  Notification,
  Button,
  Columns,
  Content,
  Form,
  Section,
  Table,
} from "react-bulma-components";
import { useState } from "react";

function ProposeTradeForm() {
  //get the users item info in a table structure

  // Get the user email param from the URL to get the ownerItems
  let { itemNo } = useParams();

  const navigate = useNavigate();

  const [proposedItemNo, setSelectedItemNo] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isTradeConfirmed, setTradeConfirmed] = useState(false);

  const {
    isLoading,
    error,
    data: myItems,
  } = useQuery(["getMyItems"], api.getMyItems.bind(api));

  const {
    isLoading: isTradeItemLoading,
    error: tradeItemError,
    data: desiredItem,
  } = useQuery(["tradeItem", itemNo], () => api.getBasicItemInfo(itemNo));

  const confirm = () => {
    if (!proposedItemNo) {
      setFormError("You must select an item to trade");
      return;
    }

    setFormError(null);

    api
      .proposeTrade(desiredItem.item_no, proposedItemNo)
      .then((resp) => {
        logger.debug("Successfully confirmed trade");
        setTradeConfirmed(true);
        navigate("/menu/");
      })
      .catch((err) => {
        setFormError("An error occurred while confirming trade");
        logger.error("Failed to confirm trade");
      });
  };

  const onChange = (e) => {
    return setSelectedItemNo(e.target.value);
  };

  if (isLoading || isTradeItemLoading) {
    return "Loading";
  }

  if (error || tradeItemError) {
    console.log(error);
    return "Error";
  }

  if (isTradeConfirmed) {
    return (
      <Notification color="success">
        Trade confirmed! <Link to="/menu" replace>Return to Main Menu</Link>
      </Notification>
    );
  }

  return (
    <Box shadowless>
      {formError && <Notification color={"warning"}>{formError}</Notification>}
      {desiredItem.distance && (
        <Notification color={"danger"}>
          ⚠️ The other user is {desiredItem.distance} miles away! ⚠️
        </Notification>
      )}
      <Section>
        <Columns>
          <Columns.Column>
            <Content>
              <h4>You are proposing a trade for</h4>
              <p>{desiredItem.title}</p>
            </Content>
          </Columns.Column>
          <Columns.Column>
            <Button color="primary" onClick={confirm}>
              Confirm
            </Button>
          </Columns.Column>
        </Columns>
      </Section>
      <Section>
        <Form.Control>
          <Table>
            <thead>
              <tr>
                <th>Item #</th>
                <th>Game type</th>
                <th>Title</th>
                <th>Condition</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myItems.result_items.map((anItem) => {
                return (
                  <tr key={anItem.item_no}>
                    <td>{anItem.item_no}</td>
                    <td>{anItem.game_type}</td>
                    <td>{anItem.title}</td>
                    <td>{anItem.condition}</td>
                    <td>
                      <Form.Radio
                        value={anItem.item_no}
                        name="proposed_item"
                        checked={proposedItemNo === String(anItem.item_no)}
                        onChange={onChange}
                      >
                        select
                      </Form.Radio>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Form.Control>
      </Section>
    </Box>
  );
}

export default ProposeTradeForm;
