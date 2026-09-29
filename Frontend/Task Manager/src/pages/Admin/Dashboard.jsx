import { useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useContext } from "react";
import { UserContext } from "../../context/useContext";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import {
  LuArrowRight,
  LuCalendarDays,
  LuCheck,
  LuClock3,
  LuClipboardList,
  LuRefreshCw,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import TaskListTable from "../../components/TaskListTable";
import CustomePieChart from "../../components/Charts/CustomePieChart";
import CustomeBarChart from "../../components/Charts/CustomeBarChart";
import toast from "react-hot-toast";

const COLORS = ["#D59A32", "#329772", "#3D82D5"];

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setdashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevel = data?.taskPriorityLevel || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
    ];
    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "high", count: taskPriorityLevel?.high || 0 },
      { priority: "medium", count: taskPriorityLevel?.medium || 0 },
      { priority: "low", count: taskPriorityLevel?.low || 0 },
    ];
    setBarChartData(PriorityLevelData);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(
        API_PATHS.TASK.GET_DASHBOARD_DATA,
      );
      if (response.data) {
        setdashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to load the team dashboard.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load dashboard data on initial render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting =
    moment().hour() < 12
      ? "Good morning"
      : moment().hour() < 18
        ? "Good afternoon"
        : "Good evening";
  const distribution = dashboardData?.charts?.taskDistribution || {};
  const overdueTaskCount = dashboardData?.statistics?.overdueTask || 0;

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6 pb-10 pt-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase text-emerald-700">
              Team overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
              {greeting}, {user?.name || "there"}
            </h1>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-slate-500">
              {moment().format("dddd, Do MMM YYYY")}{" "}
              <LuCalendarDays className="text-slate-400" />
            </span>
            <button
              type="button"
              className="dashboard-refresh-button"
              title="Refresh dashboard"
              aria-label="Refresh dashboard"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <LuRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <section
          aria-label="Task metrics"
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"
        >
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(distribution.All || 0)}
            color="bg-blue-500"
            icon={LuClipboardList}
            note="All tasks"
            noteColor="text-emerald-700"
          />

          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(distribution.Pending || 0)}
            color="bg-orange-500"
            icon={LuClock3}
            note={
              overdueTaskCount
                ? `${overdueTaskCount} overdue`
                : distribution.Pending
                  ? "Needs attention"
                  : "All clear"
            }
            noteColor={
              distribution.Pending ? "text-orange-700" : "text-emerald-700"
            }
          />

          <InfoCard
            label="In Progress"
            value={addThousandsSeparator(distribution.InProgress || 0)}
            color="bg-violet-500"
            icon={LuRefreshCw}
            note={distribution.InProgress ? "Work in motion" : "No activity"}
            noteColor="text-slate-600"
          />

          <InfoCard
            label="Completed"
            value={addThousandsSeparator(distribution.Completed || 0)}
            color="bg-green-600"
            icon={LuCheck}
            note={
              distribution.Completed ? "Work completed" : "No completed tasks"
            }
            noteColor="text-slate-600"
          />
        </section>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-white px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-800">
              Dashboard data could not be loaded
            </p>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              type="button"
              className="card-btn mx-auto mt-4"
              onClick={loadDashboardData}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="card min-w-0 p-5 md:p-6">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Distribution
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Tasks by status
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Current workload across the team
                  </p>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800">
                  Live totals
                </span>
              </div>
              {loading ? (
                <div className="h-81.25 animate-pulse rounded bg-slate-50" />
              ) : (
                <CustomePieChart data={pieChartData} color={COLORS} />
              )}
            </section>

            <section className="card min-w-0 p-5 md:p-6">
              <div className="mb-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Workload
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-800">
                  Tasks by priority
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Balance of urgency across all tasks
                </p>
              </div>
              {loading ? (
                <div className="mt-6 h-75 animate-pulse rounded bg-slate-50" />
              ) : (
                <CustomeBarChart data={barChartData} />
              )}
            </section>

            <section className="card min-w-0 p-5 md:col-span-2 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Latest activity
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-800">
                    Recent tasks
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    The latest work created across your team
                  </p>
                </div>
                <button
                  type="button"
                  className="card-btn shrink-0"
                  onClick={() => navigate("/admin/tasks")}
                >
                  Manage tasks <LuArrowRight className="text-base" />
                </button>
              </div>
              {loading ? (
                <div className="mt-5 h-52 animate-pulse rounded bg-slate-50" />
              ) : (
                <TaskListTable tableData={dashboardData?.recentTasks || []} />
              )}
            </section>
          </div>
        )}
      </div>
    </Dashboardlayout>
  );
};

export default Dashboard;
