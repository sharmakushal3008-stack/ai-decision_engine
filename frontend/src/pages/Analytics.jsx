import React from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { BarChart2 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="text-neonPurple" size={32} /> 
            Deep Analytics
          </h1>
        </div>
        <Card className="text-center py-20 flex flex-col items-center justify-center border border-neonPurple/20">
          <h2 className="text-2xl font-bold mb-4 text-neonPurple">Coming Soon</h2>
          <p className="text-gray-400">Advanced predictive modeling, peer benchmarking, and historical growth charts will be tracked here.</p>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
