import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock } from 'lucide-react';

const DashboardHeader = ({ rightElement }) => {
  const { currentUser } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const dateStr = time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = time.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 pb-1 flex items-center gap-2">
          {greeting}, <span className="text-primary">{currentUser?.name || 'User'}</span>
        </h1>
        <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary opacity-80" />
            {dateStr}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary opacity-80" />
            {timeStr}
          </div>
        </div>
      </div>
      {rightElement && (
        <div className="mt-4 md:mt-0">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
