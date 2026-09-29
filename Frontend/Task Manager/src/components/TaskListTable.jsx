import moment from "moment";

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "low":
        return "bg-slate-50 text-slate-600 border border-slate-200 ";
    }
  };
  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="py-3 px-4 text-slate-500 font-medium text-xs">
              Name
            </th>
            <th className="py-3 px-4 text-slate-500 font-medium text-xs">
              Status
            </th>
            <th className="py-3 px-4 text-slate-500 font-medium text-xs">
              Priority
            </th>
            <th className="py-3 px-4 text-slate-500 font-medium text-xs hidden md:table-cell">
              Create On
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((task) => {
            return (
              <tr key={task._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 last:border-b-0">
                <td className="py-4 px-4 text-slate-700 text-[13px] line-clamp-1 overflow-hidden">
                  {task.title}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md inline-block ${getStatusBadgeColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md inline-block ${getPriorityBadgeColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-700 text-[13px] text-nowrap hidden md:table-cell">
                  {task.createdAt
                    ? moment(task.createdAt).format("Do MMM YYYY")
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
