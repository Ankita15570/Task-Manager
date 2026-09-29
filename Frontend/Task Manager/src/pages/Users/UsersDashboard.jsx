import { useContext, useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import {
  LuArrowRight,
  LuCalendarDays,
  LuRefreshCw,
  LuTriangleAlert,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/useContext";
import CustomeBarChart from "../../components/Charts/CustomeBarChart";
import CustomePieChart from "../../components/Charts/CustomePieChart";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import InfoCard from "../../components/Cards/InfoCard";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { addThousandsSeparator } from "../../utils/helper";
import { useUserAuth } from "../../hooks/useUserAuth";

const CHART_COLORS = ["#D59A32", "#329772", "#3D82D5"];

const UsersDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(
        API_PATHS.TASK.GET_USER_DASHBOARD_DATA(user?._id),
      );
      setDashboardData(response.data);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to load your dashboard.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const taskDistribution = dashboardData?.charts?.taskDistribution || {};
  const taskPriorityLevel = dashboardData?.charts?.taskPriorityLevel || {};
  const pieChartData = [
    { status: "Pending", count: taskDistribution.Pending || 0 },
    { status: "Completed", count: taskDistribution.Completed || 0 },
    { status: "In Progress", count: taskDistribution.InProgress || 0 },
  ];
  const barChartData = [
    { priority: "high", count: taskPriorityLevel.high || 0 },
    { priority: "medium", count: taskPriorityLevel.medium || 0 },
    { priority: "low", count: taskPriorityLevel.low || 0 },
  ];
  const overdueTaskCount = dashboardData?.statistics?.overdueTask || 0;
  const greeting =
    moment().hour() < 12
      ? "Good morning"
      : moment().hour() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6 pb-10 pt-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase text-emerald-700">
              Your overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              {greeting}, {user?.name || "there"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {moment().format("dddd, Do MMMM YYYY")}
            </p>
          </div>
          <button
            type="button"
            className="card-btn h-10"
            onClick={getDashboardData}
            disabled={loading}
          >
            <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </header>

        {overdueTaskCount > 0 && (
          <button
            type="button"
            onClick={() => navigate("/users/tasks")}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-left transition-colors hover:bg-rose-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-white text-rose-600">
                <LuTriangleAlert />
              </span>
              <span>
                <strong className="block text-sm font-semibold text-rose-900">
                  {overdueTaskCount} overdue{" "}
                  {overdueTaskCount === 1 ? "task" : "tasks"}
                </strong>
                <span className="mt-0.5 block text-xs text-rose-800/70">
                  Review assignments that need attention
                </span>
              </span>
            </span>
            <LuArrowRight className="shrink-0 text-rose-700" />
          </button>
        )}

        <section
          aria-label="Task metrics"
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        >
          <InfoCard
            label="Total tasks"
            value={addThousandsSeparator(taskDistribution.All || 0)}
            color="bg-blue-600"
          />
          <InfoCard
            label="Pending tasks"
            value={addThousandsSeparator(taskDistribution.Pending || 0)}
            color="bg-amber-500"
          />
          <InfoCard
            label="In progress"
            value={addThousandsSeparator(taskDistribution.InProgress || 0)}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed"
            value={addThousandsSeparator(taskDistribution.Completed || 0)}
            color="bg-emerald-500"
          />
        </section>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Loading your dashboard...
          </p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-500">{error}</p>
            <button
              type="button"
              className="card-btn mx-auto mt-3"
              onClick={getDashboardData}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="card min-w-0 p-5 md:p-6">
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Distribution
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Your tasks by status
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    A snapshot of your current workload
                  </p>
                </div>
                <CustomePieChart data={pieChartData} color={CHART_COLORS} />
              </section>
              <section className="card min-w-0 p-5 md:p-6">
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Workload
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Your tasks by priority
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    See where urgency is concentrated
                  </p>
                </div>
                <CustomeBarChart data={barChartData} />
              </section>
            </div>

            <section className="card min-w-0 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Latest activity
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Recent tasks
                  </h2>
                </div>
                <button
                  type="button"
                  className="card-btn shrink-0"
                  onClick={() => navigate("/users/tasks")}
                >
                  View all <LuArrowRight />
                </button>
              </div>
              {dashboardData?.recentTasks?.length ? (
                <div className="mt-4 divide-y divide-slate-100">
                  {dashboardData.recentTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {task.title}
                        </p>
                        <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">
                          {task.priority || "medium"} priority
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span
                          className={`flex items-center gap-1 ${task.dueDate && moment(task.dueDate).isBefore(moment(), "day") && task.status !== "Completed" ? "font-semibold text-rose-600" : ""}`}
                        >
                          <LuCalendarDays />
                          {task.dueDate
                            ? moment(task.dueDate).format("DD MMM YYYY")
                            : "No due date"}
                        </span>
                        <span
                          className={`rounded border px-2 py-1 ${task.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : task.status === "In Progress" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  No tasks assigned to you yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </Dashboardlayout>
  );
};

export default UsersDashboard;
