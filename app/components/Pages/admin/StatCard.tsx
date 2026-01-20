//app/components/pages/admin/StatCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  color: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div className={`p-5 rounded-xl ${color} text-white shadow-md`}>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-2xl font-semibold mt-2">{value}</h2>
    </div>
  );
};

export default StatCard;
