import React from "react";

export default function MetricsCard({ title, value, sub }) {
  return (
    <div className="rounded-xl2 border border-slate-100 bg-white p-4 shadow-soft">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm font-semibold text-slate-500">{sub}</div> : null}
    </div>
  );
}

