import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

import PrivateRoute from "./routes/PrivateRoute";

import Dashboard from "./pages/Admin/Dashboard";
import ManageTask from "./pages/Admin/ManageTask";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUser from "./pages/Admin/ManageUser";

import UsersDashboard from "./pages/Users/UsersDashboard";
import MyTask from "./pages/Users/MyTask";
import ViewsDetails from "./pages/Users/ViewsDetails";

import ContextProvider, { UserContext } from "./context/useContext";

const App = () => {
  return (
    <ContextProvider>
      <div>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRole={["admin"]} />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTask />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUser />} />

            {/* Users Routes */}
            <Route element={<PrivateRoute allowedRole={["admin"]} />} />
            <Route path="/users/dashboard" element={<UsersDashboard />} />
            <Route path="/users/tasks" element={<MyTask />} />
            <Route path="/users/create-task" element={<CreateTask />} />
            <Route path="/users/task-details/:id" element={<ViewsDetails />} />

            {/* Default Route */}
            <Route path="/" element={<Root />} />
          </Routes>
        </Router>
      </div>
    </ContextProvider>
  );
};

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    <Navigate to="/users/dashboard" />
  );
};
