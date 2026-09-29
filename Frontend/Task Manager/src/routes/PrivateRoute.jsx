import React from 'react'
import { Outlet } from 'react-router-dom'

const PrivateRoute = ({allowedRole}) => {
  return <Outlet/>
}

export default PrivateRoute
