import React from 'react';
import { Activity, Camera, CheckSquare, FileText } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'log': return <Camera className="w-4 h-4 text-blue-500" />;
    case 'task': return <CheckSquare className="w-4 h-4 text-green-500" />;
    case 'approval': return <FileText className="w-4 h-4 text-amber-500" />;
    default: return <Activity className="w-4 h-4 text-slate-500" />;
  }
};

const RecentActivity = ({ activities }) => {
  return (
    <div className="glass-card mt-6 overflow-hidden">
      <div className="p-4 bg-[#e5e7eb] text-slate-900 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity & Alerts</h2>
      </div>
      <div className="p-4">
        {activities.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">No recent activity found.</p>
        ) : (
          <div className="space-y-6">
            {activities.slice(0, 7).map((activity, index) => (
              <div key={index} className="flex relative">
                {index !== activities.slice(0, 7).length - 1 && (
                  <div className="absolute top-8 left-4 bottom-0 w-px bg-border -ml-px"></div>
                )}
                <div className="relative z-10 w-8 h-8 rounded-full bg-slate-100  border border-border flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-slate-900 ">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.projectName} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
