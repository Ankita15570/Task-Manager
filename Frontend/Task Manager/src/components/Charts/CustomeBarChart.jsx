import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomeBarChart = ({ data }) => {
  const hasData = data?.some((entry) => Number(entry.count) > 0);

  // function to alternate colors
  const getBarColor = (entry) => {
    switch (entry?.priority) {
      case "low":
        return "#31803d";
      case "medium":
        return "#e9802c";
      case "high":
        return "#cb3037";
      default:
        return "#31803d";
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-slate-800 mb-1">
            {payload[0].payload.priority}
          </p>
          <p className="text-sm text-gray-600">
            Counts:{" "}
            <span className="text-sm font-medium text-gray-900">
              {payload[0].payload.count}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  if (!hasData) {
    return (
      <div className="mt-6 flex h-75 items-center justify-center text-sm text-slate-400">
        No task data yet.
      </div>
    );
  }

  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={255}>
        <BarChart
          data={data}
          margin={{ top: 18, right: 12, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#e9edf0"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="priority"
            tickFormatter={(priority) =>
              priority.charAt(0).toUpperCase() + priority.slice(1)
            }
            tick={{ fontSize: 11, fill: "#4b5863" }}
            stroke="none"
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#64717c" }}
            stroke="none"
            tickLine={false}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: "transparent" }} />

          <Bar
            dataKey="count"
            nameKey="priority"
            fill="#FF8042"
            radius={[0, 0, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry)} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              fill="#26333d"
              fontSize={11}
              fontWeight={600}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomeBarChart;
