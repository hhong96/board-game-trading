import React from "react";
import { Link } from "react-router-dom";

function UnacceptedTrades({ data }) {
  let component = 0;
  let style = {};
  if (data.unaccepted_trades >= 2) {
    style = { fontWeight: "bold", color: "red", textDecoration: 'underline' };
  }

  if (data.unaccepted_trades > 0) {
    component = (
      <Link style={style} to="/trades">
        {data.unaccepted_trades}
      </Link>
    );
  }

  return <>{component}</>;
}

export default UnacceptedTrades;
