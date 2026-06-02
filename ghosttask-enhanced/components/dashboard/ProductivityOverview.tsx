'use client';

import React from 'react';
import { BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface ProductivityOverviewProps {
  score: number;
  chartData: { day: string; value: number }[];
}

export default function ProductivityOverview({ score, chartData }: ProductivityOverviewProps) {
  // Safe defaults matching mockup values
  const defaultChartData = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 55 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 45 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 30 },
    { day: 'Sun', value: 50 },
  ];

  const data = chartData.length > 0 ? chartData : defaultChartData;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-full shadow-sm relative">
      {/* Title & Filter */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          Productivity Overview
        </h2>
        <select className="bg-slate-50 border-0 text-[10px] font-bold text-slate-500 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>

      {/* Modern Bars Section */}
      <div className="flex-1 flex items-end justify-between px-2 pt-6 pb-2 min-h-[120px] w-full">
        {data.map((item) => (
          <div key={item.day} className="flex flex-col items-center group relative flex-1">
            {/* Value popover on hover */}
            <span className="absolute -top-6 bg-slate-800 text-white font-bold text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-150 shadow pointer-events-none z-20">
              {Math.round(item.value)}%
            </span>

            {/* Custom rounded bar */}
            <div className="w-6 bg-indigo-50 rounded-lg h-28 flex items-end overflow-hidden relative">
              <div
                style={{ height: `${item.value}%` }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-500 ease-out origin-bottom"
              />
            </div>
            
            <span className="text-[10px] font-bold text-slate-400 mt-2.5">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-50 my-4" />

      {/* Dynamic Productivity Score dial */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-slate-800">Productivity Score</span>
          <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            Habit tracking status <HelpCircle className="h-3 w-3 stroke-[1.5]" />
          </span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-black text-indigo-600 tracking-tight">{score}%</span>
          <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-0.5">
            <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" /> +4%
          </span>
        </div>
      </div>

      {/* Small progress meter */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
        <div 
          style={{ width: `${score}%` }} 
          className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out" 
        />
      </div>
    </div>
  );
}
