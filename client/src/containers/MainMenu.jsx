import React from "react";
import { Box, Columns, Container, Content, Navbar } from "react-bulma-components";

import LogoutButton from "../components/LogoutButton";
import UsernameCallout from "../components/UsernameCallout";
import MenuStats from "../components/MenuStats";
import MenuLinks from "../components/MenuLinks";

export default function MainMenu() {

  return (
    <>
      <Navbar>
        <Navbar.Container align="left">
          <Navbar.Item href="/items/list">List Item</Navbar.Item>
          <Navbar.Item href="/items">My Items</Navbar.Item>
          <Navbar.Item href="/items/search">Search Items</Navbar.Item>
          <Navbar.Item href="/trades">Trade History</Navbar.Item>
          <Navbar.Item href="/trades/status">Trade Status</Navbar.Item>
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
        <Container breakpoint="desktop" style={{minHeight: '100vh'}}>
          <Box style={{width: '500px', margin: 'auto'}}>
          <Content>
            Welcome, <UsernameCallout />!
          </Content>
          <hr />
          <Columns centered vCentered={true} style={{minHeight: "", flex: "0 0 content"}}>
            <Columns.Column style={{flex: "0 0 content"}}>
              <MenuStats />
            </Columns.Column>
            <Columns.Column style={{flex: "0 0 content"}}>
              <MenuLinks />
            </Columns.Column>
          </Columns>
          </Box>
        </Container>
      </div>
    </>
  );
}
