import { useEffect, useState } from "react";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { LuChevronDown, LuSearch, LuUser } from "react-icons/lu";
import Modal from "../Modal";
import { getImageUrl } from "../../utils/helper";

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const openUserSelector = () => {
    setTempSelectedUsers(selectedUsers);
    setSearchTerm("");
    setIsModalOpen(true);
  };

  const getAllUsers = async () => {
    try {
      const response = await Axiosinstance.get(API_PATHS.USER.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.log("error fetching users:", error);
    }
  };

  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  const assignedUsers = allUsers.filter((user) =>
    selectedUsers.includes(user._id),
  );
  const filteredUsers = allUsers.filter((user) =>
    [user.name, user.email].some((value) =>
      value?.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    ),
  );

  useEffect(() => {
    // Fetching users populates the selector after the request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllUsers();
  }, []);
  return (
    <div className="task-assignee-picker">
      <button
        type="button"
        className="task-assignee-trigger"
        onClick={openUserSelector}
        aria-haspopup="dialog"
      >
        <LuSearch aria-hidden="true" />
        <span>
          {assignedUsers.length
            ? `${assignedUsers.length} member${assignedUsers.length === 1 ? "" : "s"} selected`
            : "Search for user..."}
        </span>
        <LuChevronDown className="task-assignee-chevron" aria-hidden="true" />
      </button>
      <div className="task-assignee-list">
        {assignedUsers.length ? (
          assignedUsers.map((user) => (
            <span className="task-assignee-chip" key={user._id}>
              {user.profileImageUrl ? (
                <img src={getImageUrl(user.profileImageUrl)} alt="" />
              ) : (
                <span className="task-assignee-avatar">
                  {user.name?.[0]?.toUpperCase() || <LuUser />}
                </span>
              )}
              {user.name}
            </span>
          ))
        ) : (
          <span className="task-unassigned-chip">
            <LuUser /> Unassigned
          </span>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign to"
      >
        <div className="task-assignee-modal">
          <label className="task-assignee-search">
            <LuSearch aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={({ target }) => setSearchTerm(target.value)}
              placeholder="Search by name or email"
              aria-label="Search team members"
            />
          </label>
          <div className="task-assignee-options">
            {filteredUsers.map((user) => (
              <label key={user._id} className="task-assignee-option">
                <input
                  type="checkbox"
                  checked={tempSelectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)}
                />
                {user.profileImageUrl ? (
                  <img src={getImageUrl(user.profileImageUrl)} alt="" />
                ) : (
                  <span className="task-assignee-avatar">
                    {user.name?.[0]?.toUpperCase() || <LuUser />}
                  </span>
                )}
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
              </label>
            ))}
            {!filteredUsers.length && (
              <p className="task-assignee-no-results">
                No team members match that search.
              </p>
            )}
          </div>
          <button type="button" className="btn-primary" onClick={handleAssign}>
            Assign {tempSelectedUsers.length || "members"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;
