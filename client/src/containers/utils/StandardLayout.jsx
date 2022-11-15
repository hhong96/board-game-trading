import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Container, Navbar } from "react-bulma-components";

import LogoutButton from "../../components/LogoutButton";
import UsernameCallout from "../../components/UsernameCallout";

function StandardLayout({ children }) {
  return (
    <>
      <Navbar style={{ borderBottom: "1px solid #f3f3f3" }}>
        <Navbar.Container align="left">
          <Navbar.Item renderAs={Link} to="/menu">Menu</Navbar.Item>
        </Navbar.Container>
        <Navbar.Container align="right">
          <Navbar.Item renderAs="div">
            <UsernameCallout />
            <LogoutButton />
          </Navbar.Item>
        </Navbar.Container>
      </Navbar>
      <div
        style={{
          backgroundColor: "#fbfbfb",
          minHeight: "100vh",
          padding: "10px 5px",
        }}
      >
        <Container breakpoint="desktop">
          <Outlet />
        </Container>
      </div>
    </>
  );
}

export default StandardLayout;
