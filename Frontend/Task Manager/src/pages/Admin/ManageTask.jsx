import { useEffect, useState } from "react";
import moment from "moment";
import {
  LuCalendarDays,
  LuClipboardList,
  LuDownload,
  LuListChecks,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuUser,
} from "react-icons/lu";
import toast from "react-hot-toast";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/helper";

const ManageTask = () => {
  const taskTabs = [
    { label: "All", value: "", countKey: "all" },
    { label: "Pending", value: "Pending", countKey: "pendingTask" },
    { label: "In Progress", value: "In Progress", countKey: "inProgressTask" },
    { label: "Completed", value: "Completed", countKey: "completedTask" },
  ];

  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({
    all: 0,
    pendingTask: 0,
    inProgressTask: 0,
    completedTask: 0,
  });
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);
  const navigate = useNavigate();

  const getStatusStyle = (taskStatus) =>
    ({
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Pending: "bg-amber-50 text-amber-600 border-amber-100",
      "In Progress": "bg-cyan-50 text-cyan-600 border-cyan-100",
    })[taskStatus] || "bg-slate-50 text-slate-600 border-slate-100";

  const getPriorityStyle = (priority) =>
    ({
      high: "text-rose-600",
      medium: "text-orange-600",
      low: "text-slate-500",
    })[priority] || "text-slate-500";

  const filteredTasks = tasks.filter((task) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      !query ||
      [
        task.title,
        task.description,
        task.priority,
        ...(task.assignedTo || []).map((user) => user.name),
      ].some((value) => value?.toLowerCase().includes(query))
    );
  });

  const getAllTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_ALL_TASKS, {
        params: status ? { status } : undefined,
      });
      setTasks(response.data?.tasks || []);
      setStatusSummary(
        response.data?.statusSummary || {
          all: 0,
          pendingTask: 0,
          inProgressTask: 0,
          completedTask: 0,
        },
      );
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || "Unable to load tasks.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTaskReport = async () => {
    try {
      setDownloadingReport(true);
      const response = await Axiosinstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "tasks-report.xlsx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to download task report.",
      );
    } finally {
      setDownloadingReport(false);
    }
  };

  useEffect(() => {
    // Fetch tasks when the selected status changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Dashboardlayout activeMenu="Manage Tasks">
      <div className="mx-auto max-w-7xl pb-10 pt-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase text-emerald-700">
              Team workspace
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Task management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep ownership, priorities, and deadlines moving in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="card-btn h-10"
              onClick={downloadTaskReport}
              disabled={downloadingReport}
            >
              <LuDownload />{" "}
              {downloadingReport ? "Preparing report..." : "Export report"}
            </button>
            <button
              type="button"
              className="card-btn h-10"
              onClick={getAllTasks}
              disabled={loading}
            >
              <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              className="btn-primary manage-task-new-button m-0! flex h-10 items-center gap-2"
              onClick={() => navigate("/admin/create-task")}
            >
              <LuPlus /> New task
            </button>
          </div>
        </header>

        <div
          className="mt-6 flex flex-col justify-between gap-3 border-b border-slate-200 sm:flex-row sm:items-center"
          role="tablist"
          aria-label="Task status filters"
        >
          <div className="flex min-w-max gap-5 overflow-x-auto">
            {taskTabs.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  key={tab.value || "all"}
                  onClick={() => setStatus(tab.value)}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${isActive ? "border-emerald-700 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 text-[11px] tabular-nums ${isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                  >
                    {statusSummary[tab.countKey]}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="mb-2 flex h-9 w-full items-center gap-2 rounded border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-emerald-600 sm:mb-2 sm:w-64">
            <LuSearch className="shrink-0" />
            <input
              type="search"
              value={searchTerm}
              onChange={({ target }) => setSearchTerm(target.value)}
              placeholder="Search tasks or owners"
              aria-label="Search tasks or owners"
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LuClipboardList className="text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-800">
                {status || "All"} tasks
              </h2>
            </div>
            {!loading && !error && (
              <p className="text-xs text-slate-500">
                Showing {filteredTasks.length} of {tasks.length}
              </p>
            )}
          </div>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Loading tasks...
            </p>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button
                type="button"
                className="card-btn mx-auto mt-3"
                onClick={getAllTasks}
              >
                Try again
              </button>
            </div>
          ) : filteredTasks.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task) => {
                const totalChecklist = task.todoCheckList?.length || 0;
                const completedChecklist =
                  task.completedTodoCount ??
                  task.todoCheckList?.filter((item) => item.completed).length ??
                  0;
                const progress = totalChecklist
                  ? Math.round((completedChecklist / totalChecklist) * 100)
                  : task.progress || 0;
                const isOverdue =
                  task.dueDate &&
                  moment(task.dueDate).isBefore(moment(), "day") &&
                  task.status !== "Completed";

                return (
                  <article
                    key={task._id}
                    className="group flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase ${getPriorityStyle(task.priority)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${task.priority === "high" ? "bg-rose-500" : task.priority === "medium" ? "bg-orange-500" : "bg-slate-400"}`}
                        />
                        {task.priority || "low"} priority
                      </span>
                      <span
                        className={`shrink-0 rounded border px-2 py-1 text-[10px] font-medium ${getStatusStyle(task.status)}`}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 min-h-12 text-[15px] font-semibold leading-5 text-slate-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                      {task.description || "No description provided."}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-y border-slate-100 py-2.5 text-[11px] text-slate-500">
                      <span className="flex min-w-0 items-center gap-1.5 truncate">
                        <LuCalendarDays className="shrink-0" />
                        Created{" "}
                        {task.createdAt
                          ? moment(task.createdAt).format("DD MMM YYYY")
                          : "-"}
                      </span>
                      <span
                        className={`flex min-w-0 items-center justify-end gap-1.5 truncate text-right ${isOverdue ? "font-semibold text-rose-600" : ""}`}
                      >
                        <LuCalendarDays className="shrink-0" />
                        {isOverdue ? "Overdue" : "Due"}{" "}
                        {task.dueDate
                          ? moment(task.dueDate).format("DD MMM YYYY")
                          : "-"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <LuListChecks />
                          Checklist
                        </span>
                        <span className="tabular-nums">
                          {completedChecklist}/{totalChecklist} done
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${task.status === "Completed" ? "bg-emerald-500" : "bg-cyan-600"}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-500">
                        {task.assignedTo?.length ? (
                          <>
                            <div className="flex shrink-0 -space-x-2">
                              {task.assignedTo.slice(0, 3).map((user) =>
                                user.profileImageUrl ? (
                                  <img
                                    key={user._id}
                                    src={getImageUrl(user.profileImageUrl)}
                                    alt={user.name || "Assignee"}
                                    className="h-7 w-7 rounded-full border-2 border-white object-cover"
                                  />
                                ) : (
                                  <span
                                    key={user._id}
                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200"
                                  >
                                    <LuUser />
                                  </span>
                                ),
                              )}
                            </div>
                            <span className="truncate">
                              {task.assignedTo
                                .slice(0, 2)
                                .map((user) => user.name)
                                .filter(Boolean)
                                .join(", ")}
                              {task.assignedTo.length > 2
                                ? ` +${task.assignedTo.length - 2}`
                                : ""}
                            </span>
                          </>
                        ) : (
                          "Unassigned"
                        )}
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                        onClick={() =>
                          navigate("/admin/create-task", {
                            state: { taskId: task._id },
                          })
                        }
                      >
                        Edit task
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <LuSearch className="mx-auto text-xl text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No matching tasks
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try another title, description, priority, or owner.
              </p>
            </div>
          )}
        </section>
      </div>
    </Dashboardlayout>
  );
};

export default ManageTask;
