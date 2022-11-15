// import { Form, Formik, Field, ErrorMessage } from "formik";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "react-bulma-components";
import api from "../../utils/api";
import logger from "../../utils/logger";
import { useQuery } from "react-query";

function TradeStatusForm() {
  // Get the tradeId param from the URL.
  let { tradeId } = useParams();
  const {
    isLoading,
    error,
    data: trade,
  } = useQuery(["tradeDetails", tradeId], () => api.getTrade(tradeId));

  const navigate = useNavigate();

  const reject = () => {
    api
      .reject_trade()
      .then((resp) => {
        logger.debug("Successfully rejected trade");
        navigate("/trades/");
      })
      .catch((err) => {
        logger.error("Failed to reject trade");
      });
  };

  const accept = () => {
    api
      .accept_trade()
      .then((resp) => {
        logger.debug("Successfully accepted trade");
        navigate("/trades/");
      })
      .catch((err) => {
        logger.error("Failed to accept trade");
      });
  };

  if (isLoading) {
    return "Loading";
  }
  if (error) {
    console.log(error);
    return "Error";
  }

  return (
    <div>
      <section>
        <h>Accept/Reject Trades</h>
        <table class="accept_reject_tradetable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Desited Item</th>
              <th>Proposer</th>
              <th>Rank</th>
              <th>Distance</th>
              <th>Proposed Item</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{trade.proposal_date}</td>
              <td>{trade.desired_item}</td>
              <td>{trade.proposer}</td>
              <td>{trade.RNK}</td>
              <td>{0}</td>
              <td>{trade.proposed_item}</td>
              <td>
                <Button onClick={accept}>Accept</Button>
                <Button onClick={reject}>Reject</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default TradeStatusForm;
