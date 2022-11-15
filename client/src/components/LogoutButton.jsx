import React from "react";
import { Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import logger from "../utils/logger";

function LogoutButton() {
  const navigate = useNavigate();
  const logout = () => {
    api
      .logout()
      .then((resp) => {
        logger.debug("Successfully logged out");
        navigate("/login");
      })
      .catch((err) => {
        logger.error("Failed to logout");
      });
  };
  
  return <Button onClick={logout}>Logout</Button>;
}

export default LogoutButton;
