import React from "react";
import { Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import logger from "../utils/logger";

function AcceptButton({acceptHandler}) {
  return <Button onClick={acceptHandler}>Accept</Button>;
}

export default AcceptButton;
