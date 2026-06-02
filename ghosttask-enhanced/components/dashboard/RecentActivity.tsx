'use client';

import React from 'react';
import { IActivity } from '@/models/Activity';
import { CheckCircle2, RefreshCw, AlertCircle, PlusCircle, CalendarRange } from 'lucide-react';

interface RecentActivityProps {
  activities: IActivity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'rescheduled':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case 'missed':
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case 'added':
        return <PlusCircle className="h-4 w-4 text-sky-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-100';
      case 'rescheduled':
        return 'bg-amber-50 border-amber-100';
      case 'missed':
        return 'bg-rose-50 border-rose-100';
      case 'added':
        return 'bg-sky-50 border-sky-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const formatActivityTime = (dateStr: Date) => {
    const d = new Date(dateStr);
    const day = d.getDate() === new Date().getDate() ? 'Today' : 'Yesterday';
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col h-full shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
        <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <CalendarRange className="h-4 w-4 text-indigo-500" />
          Recent Activity
        </h2>
      </div>

      {/* Activity list */}
      <div className="flex-1 space-y-4 overflow-y-auto max-h-[160px] pr-1">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No recent activity logs.</p>
        ) : (
          activities.map((act) => (
            <div key={act._id as any} className="flex items-start space-x-3.5 group">
              {/* Left icon wrapper */}
              <div className={`p-2 rounded-xl border flex items-center justify-center transition-all ${getActionStyle(act.action)}`}>
                {getActionIcon(act.action)}
              </div>

              {/* Detail text */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 capitalize leading-none">
                    {act.action} <span className="normal-case font-normal text-slate-500">"{act.taskTitle}"</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {formatActivityTime(act.timestamp)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {act.details || 'Productivity engine logged actions'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
