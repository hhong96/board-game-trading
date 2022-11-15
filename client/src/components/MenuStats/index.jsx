import React from "react";
import { useQuery } from "react-query";
import api from "../../utils/api";
import MenuStatsPanel from "./MenuStatsPanel";

function MenuStats() {
  const { isLoading, error, data } = useQuery(
    ["menuStats"],
    api.userStats.bind(api)
  );

  if (isLoading) {
    return "Loading";
  } else {
    return <MenuStatsPanel data={data} />;
  }
}

export default MenuStats;
