import { useEffect, useRef, useState } from "react";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import toast from "react-hot-toast";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  LuClipboardList,
  LuPaperclip,
  LuPlus,
  LuTrash2,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { PRIORITY_DATA } from "../../utils/data";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsers from "../../components/inputs/SelectUsers";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import uploadImage from "../../utils/uploadImage";
import { UserContext } from "../../context/useContext";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isMember = user?.role !== "admin";

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "low",
    dueDate: "",
    assignedTo: [],
    todoCheckList: [],
    attachment: [],
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDeleteAlter, setOpenDeleteAlter] = useState(false);
  const [checklistItem, setChecklistItem] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const attachmentInputRef = useRef(null);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
    setFieldErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
  };

  // reset the task
  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "low",
      dueDate: "",
      assignedTo: [],
      todoCheckList: [],
      attachment: [],
    });
  };

  const addChecklistItem = () => {
    const text = checklistItem.trim();
    if (!text) return;
    handleValueChange("todoCheckList", [
      ...taskData.todoCheckList,
      { text, completed: false },
    ]);
    setChecklistItem("");
    setShowChecklistInput(false);
  };

  const removeChecklistItem = (index) => {
    handleValueChange(
      "todoCheckList",
      taskData.todoCheckList.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const uploadAttachments = async (files) => {
    if (!files?.length) return;
    try {
      setLoading(true);
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadImage(file)),
      );
      handleValueChange("attachment", [
        ...taskData.attachment,
        ...uploads.map(({ imageUrl }) => imageUrl),
      ]);
    } catch (uploadError) {
      toast.error(
        uploadError.response?.data?.message || "Unable to upload attachment",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = async ({ target }) => {
    await uploadAttachments(target.files);
    target.value = "";
  };

  const handleAttachmentDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    uploadAttachments(event.dataTransfer.files);
  };

  const createTask = async () => {
    const payload = isMember
      ? { ...taskData, assignedTo: [user._id] }
      : taskData;
    await Axiosinstance.post(API_PATHS.TASK.CREATE_TASK, payload);
    toast.success("Task created successfully");
    clearData();
    navigate(isMember ? "/users/tasks" : "/admin/tasks");
  };

  //Update tasks
  const updateTask = async () => {
    await Axiosinstance.put(API_PATHS.TASK.UPDATE_TASK(taskId), taskData);
    toast.success("Task updated successfully");
    navigate("/admin/tasks");
  };

  const validateForm = () => {
    const validationErrors = {};
    const today = moment().startOf("day");

    if (!taskData.title.trim())
      validationErrors.title = "Task title is required.";
    if (taskData.title.trim().length > 120)
      validationErrors.title = "Task title must be 120 characters or fewer.";
    if (!taskData.description.trim())
      validationErrors.description = "Description is required.";
    if (!taskData.dueDate) validationErrors.dueDate = "Due date is required.";
    else if (moment(taskData.dueDate).isBefore(today, "day"))
      validationErrors.dueDate = "Due date cannot be in the past.";
    setFieldErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (taskId) await updateTask();
      else await createTask();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save task. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  //get task info by  id
  const taskDetailsById = async () => {
    try {
      const response = await Axiosinstance.get(
        API_PATHS.TASK.GET_TASK_BY_ID(taskId),
      );
      const task = response.data;
      setTaskData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "low",
        dueDate: task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "",
        assignedTo: (task.assignedTo || []).map((user) => user._id || user),
        todoCheckList: task.todoCheckList || [],
        attachment: task.attachment || [],
      });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to load task",
      );
      navigate("/admin/tasks");
    }
  };

  //delete Task
  const deleteTask = async () => {
    try {
      await Axiosinstance.delete(API_PATHS.TASK.DELETE_TASK(taskId));
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to delete task",
      );
    } finally {
      setOpenDeleteAlter(false);
    }
  };

  useEffect(() => {
    // The request updates form state after the edit record is fetched.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (taskId) taskDetailsById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  return (
    <Dashboardlayout activeMenu={isMember ? "My Tasks" : "Create Task"}>
      <div className="create-task-page">
        <div className="create-task-container">
          <header className="create-task-header">
            <div>
              <nav className="create-task-breadcrumb" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() =>
                    navigate(isMember ? "/users/tasks" : "/admin/tasks")
                  }
                >
                  Tasks
                </button>
                <span>/</span>
                <span>{taskId ? "Edit Task" : "Create Task"}</span>
              </nav>
              <h1>{taskId ? "Edit Task" : "Create Task"}</h1>
            </div>
            {taskId && (
              <div className="create-task-header-actions">
                <button
                  type="button"
                  className="create-task-delete"
                  onClick={() => setOpenDeleteAlter(true)}
                >
                  <LuTrash2 /> Delete
                </button>
              </div>
            )}
          </header>

          <form id="task-form" onSubmit={handleSubmit}>
            <div className="create-task-sheet">
              <div className="create-task-column create-task-column-main">
                <div className="create-task-field">
                  <label htmlFor="task-title">Task Title</label>
                  <input
                    id="task-title"
                    placeholder="e.g. Fix payment gateway timeout errors"
                    className="form-input"
                    value={taskData.title}
                    onChange={({ target }) =>
                      handleValueChange("title", target.value)
                    }
                    maxLength={120}
                    required
                  />
                  {fieldErrors.title && (
                    <p className="create-task-error">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="create-task-field">
                  <label htmlFor="task-description">Description</label>
                  <textarea
                    id="task-description"
                    placeholder="Describe the task and its expected outcome"
                    className="form-input create-task-description"
                    rows={5}
                    value={taskData.description}
                    onChange={({ target }) =>
                      handleValueChange("description", target.value)
                    }
                    required
                  />
                  {fieldErrors.description && (
                    <p className="create-task-error">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>

                <div className="create-task-field">
                  <label>Priority</label>
                  <SelectDropdown
                    option={PRIORITY_DATA}
                    value={taskData.priority}
                    onChange={(value) => handleValueChange("priority", value)}
                    placeholder="Select priority"
                  />
                </div>

                <section className="create-task-checklist">
                  <div className="create-task-section-heading">
                    <h2>
                      <LuClipboardList /> Checklist
                    </h2>
                    <button
                      type="button"
                      className="create-task-add-item"
                      onClick={() =>
                        setShowChecklistInput((visible) => !visible)
                      }
                    >
                      <LuPlus /> Add item
                    </button>
                  </div>
                  {showChecklistInput && (
                    <div className="create-task-add-row">
                      <input
                        autoFocus
                        aria-label="New checklist item"
                        className="form-input"
                        placeholder="Add a checklist item"
                        value={checklistItem}
                        onChange={({ target }) =>
                          setChecklistItem(target.value)
                        }
                        onKeyDown={(event) =>
                          event.key === "Enter" &&
                          (event.preventDefault(), addChecklistItem())
                        }
                      />
                      <button
                        type="button"
                        className="create-task-add-confirm"
                        onClick={addChecklistItem}
                      >
                        Add
                      </button>
                    </div>
                  )}
                  <div className="create-task-checklist-items">
                    {taskData.todoCheckList.length ? (
                      taskData.todoCheckList.map((item, index) => (
                        <div
                          key={`${item.text}-${index}`}
                          className="create-task-checklist-row"
                        >
                          <label>
                            <input
                              type="checkbox"
                              aria-label={`Mark ${item.text} as completed`}
                              checked={Boolean(item.completed)}
                              onChange={({ target }) =>
                                handleValueChange(
                                  "todoCheckList",
                                  taskData.todoCheckList.map(
                                    (checklistItem, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...checklistItem,
                                            completed: target.checked,
                                          }
                                        : checklistItem,
                                  ),
                                )
                              }
                            />
                            <span
                              className={item.completed ? "is-complete" : ""}
                            >
                              {item.text}
                            </span>
                          </label>
                          <button
                            type="button"
                            className="create-task-remove-item"
                            aria-label={`Remove ${item.text}`}
                            onClick={() => removeChecklistItem(index)}
                          >
                            <LuX />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="create-task-empty-checklist">
                        Add checklist items to break this task into steps.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <div className="create-task-column create-task-column-side">
                <div className="create-task-field">
                  <label htmlFor="task-due-date">Due Date</label>
                  <input
                    id="task-due-date"
                    className="form-input"
                    value={taskData.dueDate}
                    onChange={({ target }) =>
                      handleValueChange("dueDate", target.value)
                    }
                    type="date"
                    min={moment().format("YYYY-MM-DD")}
                    required
                  />
                  {fieldErrors.dueDate && (
                    <p className="create-task-error">{fieldErrors.dueDate}</p>
                  )}
                </div>

                {!isMember ? (
                  <div className="create-task-field">
                    <label>Assign to</label>
                    <SelectUsers
                      selectedUsers={taskData.assignedTo}
                      setSelectedUsers={(value) =>
                        handleValueChange("assignedTo", value)
                      }
                    />
                  </div>
                ) : (
                  <div className="create-task-field">
                    <label>Assign to</label>
                    <div className="create-task-assigned-self">
                      {user?.name || "You"}
                      <span>Assigned to you</span>
                    </div>
                  </div>
                )}

                <section className="create-task-attachments">
                  <div className="create-task-section-heading">
                    <h2>
                      <LuPaperclip /> Attachments
                    </h2>
                    <span>{taskData.attachment.length} files</span>
                  </div>
                  <input
                    ref={attachmentInputRef}
                    className="create-task-file-input"
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                  />
                  <div
                    className={`create-task-dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleAttachmentDrop}
                  >
                    <LuUpload className="create-task-upload-icon" />
                    <p>Drag &amp; drop files here or</p>
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      disabled={loading}
                    >
                      Choose files <LuUpload />
                    </button>
                    <span>{loading ? "Uploading..." : "No file selected"}</span>
                  </div>
                  {taskData.attachment.length > 0 && (
                    <div className="create-task-attachment-list">
                      {taskData.attachment.map((file, index) => (
                        <div key={`${file}-${index}`}>
                          <span>
                            <LuPaperclip /> Attachment {index + 1}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove attachment ${index + 1}`}
                            onClick={() =>
                              handleValueChange(
                                "attachment",
                                taskData.attachment.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                          >
                            <LuX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {error && (
                <p className="create-task-form-error" role="alert">
                  {error}
                </p>
              )}
              <footer className="create-task-footer">
                <button
                  type="button"
                  className="create-task-cancel"
                  onClick={() =>
                    navigate(isMember ? "/users/tasks" : "/admin/tasks")
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-task-submit"
                  disabled={loading}
                >
                  <LuPlus />{" "}
                  {loading
                    ? "Saving..."
                    : taskId
                      ? "Update Task"
                      : "Create Task"}
                </button>
              </footer>
            </div>
          </form>
        </div>

        {openDeleteAlter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
              <h2 className="font-semibold text-slate-800">
                Delete this task?
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                This action cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  className="card-btn"
                  onClick={() => setOpenDeleteAlter(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white"
                  onClick={deleteTask}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboardlayout>
  );
};

export default CreateTask;
