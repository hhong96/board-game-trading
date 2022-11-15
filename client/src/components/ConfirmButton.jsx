import React from "react";
import { Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import logger from "../utils/logger";

function ConfirmButton({confirmHandler}) {
  return <Button onClick={confirmHandler}>Confirm</Button>;
}

export default ConfirmButton;