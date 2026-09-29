import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/useContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { getImageUrl } from "../../utils/helper";
import { FiCheck } from "react-icons/fi";

const SideMenu = ({ activeMenu, onNavigate }) => {
  const { user, clearUser } = useContext(UserContext);
  const location = useLocation();
  const isUserRoute = location.pathname.startsWith("/users");
  const isAdmin =
    !isUserRoute &&
    String(user?.role || "")
      .trim()
      .toLowerCase() === "admin";
  const sideMenuData = isAdmin ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA;
  const initials = (user?.name || "User")
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }

    navigate(route);
    onNavigate?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
    onNavigate?.();
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-brand">
        <span className="dashboard-brand-mark" aria-hidden="true">
          <FiCheck />
        </span>
        <span>Task Manager</span>
      </div>
      <div className="dashboard-user-profile">
        <div className="dashboard-user-avatar">
          {user?.profileImageUrl ? (
            <img src={getImageUrl(user.profileImageUrl)} alt="Profile" />
          ) : (
            <div className="dashboard-user-placeholder">{initials}</div>
          )}
        </div>

        <div className="dashboard-user-copy">
          <h5 className="dashboard-user-name">{user?.name || ""}</h5>
          <div className="dashboard-user-meta">
            <span className="dashboard-role-badge">
              {isAdmin ? "Admin" : "Member"}
            </span>
            <p className="dashboard-user-email">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      <nav className="dashboard-nav" aria-label="Workspace navigation">
        <p className="dashboard-nav-label">Workspace</p>
        {sideMenuData.map((item) => {
          const isActive = activeMenu === item.label;
          return (
            <button
              type="button"
              key={item.id}
              className={`dashboard-nav-item ${isActive ? "is-active" : ""} ${item.label === "Logout" ? "is-logout" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleClick(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideMenu;
