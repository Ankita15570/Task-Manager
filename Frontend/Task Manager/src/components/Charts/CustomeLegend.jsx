const CustomeLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-2 pt-1">
      {payload?.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-xs font-medium text-gray-700">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomeLegend;
