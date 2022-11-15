import React from 'react'
import { Navigate, Outlet } from 'react-router'
import api from './api';

function PublicRoute({ children, redirectPath = "/menu"}) {
  const user = api.getSession()
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }


  return children ? children : <Outlet />;
}

export default PublicRoute