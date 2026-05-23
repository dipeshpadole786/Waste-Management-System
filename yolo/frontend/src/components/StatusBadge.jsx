import React from "react";

function cls(statusColor) {
  if (statusColor === "green") return "bg-green-50 text-green-700 ring-green-200";
  if (statusColor === "yellow") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

export default function StatusBadge({ status, statusColor }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${cls(statusColor)}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

