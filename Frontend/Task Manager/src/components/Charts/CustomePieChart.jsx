import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import CustomeTooltip from "./CustomeTooltip";
import CustomeLegend from "./CustomeLegend";

const CustomePieChart = ({ data, color }) => {
  const hasData = data?.some((entry) => Number(entry.count) > 0);
  const total =
    data?.reduce((sum, entry) => sum + Number(entry.count || 0), 0) || 0;
  const leadingStatus = data?.reduce(
    (leading, entry) => (entry.count > (leading?.count || 0) ? entry : leading),
    null,
  );
  const leadingShare = total
    ? Math.round((leadingStatus.count / total) * 100)
    : 0;

  if (!hasData) {
    return (
      <div className="flex h-67.5 items-center justify-center text-sm text-slate-400">
        No task data yet.
      </div>
    );
  }

  return (
    <div className="dashboard-pie-wrap">
      <ResponsiveContainer width="100%" height={270}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={102}
            innerRadius={76}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color[index % color.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomeTooltip />} />
          <Legend content={<CustomeLegend />} />
        </PieChart>
      </ResponsiveContainer>
      <div
        className="dashboard-pie-center"
        aria-label={`${leadingShare}% ${leadingStatus?.status || "task status"}`}
      >
        <strong>{leadingShare}%</strong>
        <span>{leadingStatus?.status || "Tasks"}</span>
      </div>
    </div>
  );
};

export default CustomePieChart;
