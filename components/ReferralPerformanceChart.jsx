import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReferralPerformanceChartProps {
  data?: any[];
  className?: string;
}

const ReferralPerformanceChart: React.FC<ReferralPerformanceChartProps> = ({ 
  data = [], 
  className = '' 
}) => {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#ffd700"
            fontSize={12}
          />
          <YAxis 
            stroke="#ffd700"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #ffd700',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffd700" 
            strokeWidth={2}
            dot={{ fill: '#ffd700', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReferralPerformanceChart;