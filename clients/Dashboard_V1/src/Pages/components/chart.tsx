import React from 'react';
//import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  day: string;
  percentage: number;
  color: string;
}

interface WeeklyChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const Chart: React.FC<WeeklyChartProps> = ({ 
  data, 
  title = "Activité Hebdomadaire" 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="h-64">
        {/* <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
              cursor={{ stroke: "#f8fafc", strokeWidth: 2 }}
            />
            <Line 
              dataKey="percentage" 
              stroke="#6366f1"
              strokeWidth={1}
              dot={{ r: 4 }}
            >
            </Line>
          </LineChart>
        </ResponsiveContainer> */}
      </div>
    </div>
  );
};
export default Chart
export {ChartDataPoint, WeeklyChartProps};

