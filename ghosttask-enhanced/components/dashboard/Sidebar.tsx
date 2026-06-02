'use client';

import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Sparkles, BarChart2, Clock, Bell, Settings, Menu } from 'lucide-react';

interface SidebarProps {
  autoReschedule: boolean;
  onToggleAutoReschedule: () => void;
  activeItem: string;
  setActiveItem: (item: string) => void;
}

export default function Sidebar({ autoReschedule, onToggleAutoReschedule, activeItem, setActiveItem }: SidebarProps) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', icon: CheckSquare },
    { name: 'Calendar', icon: Calendar },
    { name: 'Smart Reschedule', icon: Sparkles, badge: true },
    { name: 'Statistics', icon: BarChart2 },
    { name: 'Focus Mode', icon: Clock },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-[#110e2e] text-slate-300 flex flex-col h-full flex-shrink-0 z-30 shadow-2xl relative border-r border-[#1e1a4a]">
      <div className="p-6 flex items-center justify-between border-b border-[#1e1a4a]">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <CheckSquare className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              GhostTask <span className="text-indigo-400 font-normal text-xs uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">AI</span>
            </h1>
          </div>
        </div>
        <button className="lg:hidden text-slate-400 hover:text-white transition"><Menu className="h-5 w-5" /></button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          return (
            <button key={item.name} onClick={() => setActiveItem(item.name)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-[#1a1740] hover:text-white text-slate-400'}`}>
              <div className="flex items-center space-x-3.5">
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1a4a] bg-[#0c0924] space-y-4">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Auto-Reschedule</span>
            <span className="text-[10px] text-slate-500">AI auto-manages missed tasks</span>
          </div>
          <button onClick={onToggleAutoReschedule}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${autoReschedule ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'}`}>
            <span className="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300" />
          </button>
        </div>

        <div className="bg-[#15113d] border border-[#231e5e] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="animate-ghost-float relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-14 h-14 fill-white drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]">
              <path d="M50,15 C33.4,15 20,28.4 20,45 L20,75 C20,78.9 23.6,81.3 27,79.8 L36,75.8 L45,79.8 C48.1,81.2 51.9,81.2 55,79.8 L64,75.8 L73,79.8 C76.4,81.3 80,78.9 80,75 L80,45 C80,28.4 66.6,15 50,15 Z" />
              <circle cx="40" cy="45" r="4.5" fill="#110e2e" />
              <circle cx="60" cy="45" r="4.5" fill="#110e2e" />
              <ellipse cx="32" cy="50" rx="3.5" ry="2" fill="#ff8ba7" />
              <ellipse cx="68" cy="50" rx="3.5" ry="2" fill="#ff8ba7" />
              <path d="M46,55 Q50,59 54,55" stroke="#110e2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="text-center mt-3 z-10">
            <p className="text-xs font-bold text-slate-100">GhostTask AI</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[170px] leading-relaxed">
              {autoReschedule ? 'Watching for missed tasks to reschedule...' : 'Idle. Enable auto-reschedule to activate.'}
            </p>
          </div>
          <div className="flex space-x-1 items-end h-4 mt-3">
            {[1,2,3,4,5,6].map(i => (
              <span key={i} style={{ animationDelay: `${i*0.15}s`, height: `${Math.random()*100}%` }}
                className={`w-1 rounded-full bg-indigo-500 ${autoReschedule ? 'animate-wave-bar' : 'opacity-20'}`} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
