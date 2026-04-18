const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="font-display text-3xl text-brand-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-brand-700">{description}</p>
    </div>
    {action}
  </div>
);

export default PageHeader;
