import React from "react";

function ResponseTime({ data }) {
  let color = "";
  let avg_response_time = data.avg_response_time || "None";
  let fontWeight = "normal";
  if (avg_response_time && !isNaN(avg_response_time)) {
    avg_response_time = (parseFloat(avg_response_time)).toFixed(1);
    if (avg_response_time < 7) {
      color = "green";
    } else if (avg_response_time < 14) {
      color = "#CCCC00 	";
    } else if (avg_response_time < 20) {
      color = "orange";
    } else if (avg_response_time < 27) {
      color = "red";
    } else {
      color = "red";
      fontWeight = "bold";
    }
  }
  
  return <div style={{ color, fontWeight }}>{avg_response_time}</div>;
}



export default ResponseTime;
