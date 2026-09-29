const InfoCard = ({
  label,
  value,
  color,
  icon: Icon,
  note,
  noteColor = "text-slate-500",
}) => {
  if (Icon) {
    return (
      <article className="metric-card metric-card-featured">
        <span className={`metric-card-icon ${color}`} aria-hidden="true">
          <Icon />
        </span>
        <div className="metric-card-label">
          <span>{label}</span>
        </div>
        <p className="metric-card-value">{value}</p>
        {note && <p className={`metric-card-note ${noteColor}`}>{note}</p>}
      </article>
    );
  }

  return (
    <article className="metric-card">
      <div className="metric-card-label">
        <span className={`metric-card-dot ${color}`} />
        <span>{label}</span>
      </div>
      <p className="metric-card-value">{value}</p>
    </article>
  );
};

export default InfoCard;
