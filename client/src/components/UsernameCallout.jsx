import React from "react";
import { useQuery } from "react-query";

import api from "../utils/api";
import Skeleton from "../components/utils/Skeleton";

function UsernameCallout() {
  const { isLoading, error, data } = useQuery(["userProfile"], api.profile.bind(api));

  let userCallout = undefined;
  if (isLoading) {
    userCallout = <Skeleton />;
  } else if (error) {
    userCallout = <span>{error.message}</span>;
  } else {
    userCallout = (
      <span>
        {data.first_name} {data.last_name} ({data.nickname})
      </span>
    );
  }

  return <>{userCallout}</>;
}

export default UsernameCallout;
