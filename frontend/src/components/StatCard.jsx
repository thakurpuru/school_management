const StatCard = ({ title, value, tone = "brand" }) => (
  <div className="panel p-6">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
      {title}
    </p>
    <p
      className={`mt-4 font-display text-4xl ${
        tone === "accent" ? "text-accent-600" : "text-brand-900"
      }`}
    >
      {value}
    </p>
  </div>
);

export default StatCard;
