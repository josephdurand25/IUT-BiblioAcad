import React from "react";

interface CardProps {
  title: string;
  value: string;
  percentage: string;
  icon: string;
  trend?: 'up' | 'down';
  color?: string;
}

const StatCard: React.FC<CardProps> = ({ 
  title, 
  value, 
  percentage, 
  icon, 
  trend = "up", 
  color = "#6366f1" 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-3">
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {percentage}
            </span>
            <span className="text-xs text-gray-500 ml-2">ce mois</span>
          </div>
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <i 
            className={`${icon} text-xl`}
            style={{ color }}
          />
        </div>
      </div>
    </div>
  );
};
export default StatCard
export type {CardProps} ;


