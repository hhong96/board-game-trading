import React from "react";
import { Navigate, Outlet } from "react-router";
import api from "./api";

export default function ProtectedRoute({ children, redirectPath = '/login' }) {
  const user = api.getSession();
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}
