'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TaskList from '@/components/dashboard/TaskList';
import RescheduleSuggestions from '@/components/dashboard/RescheduleSuggestions';
import FocusTimer from '@/components/dashboard/FocusTimer';
import ProductivityOverview from '@/components/dashboard/ProductivityOverview';
import CalendarWidget from '@/components/dashboard/CalendarWidget';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { ITask } from '@/models/Task';
import { ISuggestion } from '@/models/Suggestion';
import { IActivity } from '@/models/Activity';
import {
  Search, Bell, TrendingUp, CheckCircle2, AlertTriangle, Layers,
  ChevronDown, Sparkles, RefreshCw, FolderOpen, Database, Settings as SettingsIcon,
  X, AlertCircle
} from 'lucide-react';

interface MissedAlert {
  id: string;
  title: string;
  dueDate: Date;
  category: string;
}

export default function Dashboard({ user, token, onLogout }: { user?: any; token?: string; onLogout?: () => void }) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, completionRate: 0, productivityScore: 72, chartData: [] });
  const [autoReschedule, setAutoReschedule] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [dbStatus, setDbStatus] = useState('Connecting...');
  const [showNotifications, setShowNotifications] = useState(false);
  const [missedAlerts, setMissedAlerts] = useState<MissedAlert[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarDateTasks, setCalendarDateTasks] = useState<ITask[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const apiFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, { ...options, headers: { ...(options.headers || {}), ...authHeaders } });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, suggestionsRes, statsRes, activitiesRes] = await Promise.all([
        apiFetch('/api/tasks'),
        apiFetch('/api/suggestions'),
        apiFetch('/api/statistics'),
        apiFetch('/api/activities'),
      ]);
      const [tasksJson, suggestionsJson, statsJson, activitiesJson] = await Promise.all([
        tasksRes.json(), suggestionsRes.json(), statsRes.json(), activitiesRes.json(),
      ]);

      if (tasksJson.success) {
        setTasks(tasksJson.data);
        // Build missed alerts from overdue tasks
        const missed = tasksJson.data
          .filter((t: ITask) => t.status === 'overdue' || (t.status === 'pending' && new Date(t.dueDate) < new Date()))
          .map((t: ITask) => ({ id: t._id as any, title: t.title, dueDate: t.dueDate, category: t.category }));
        setMissedAlerts(missed);
      }
      if (suggestionsJson.success) setSuggestions(suggestionsJson.data);
      if (statsJson.success) setStats(statsJson.data);
      if (activitiesJson.success) setActivities(activitiesJson.data);
      setDbStatus('Connected');
    } catch (error) {
      setDbStatus('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForDate = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const res = await apiFetch(`/api/tasks?date=${dateStr}`);
    const data = await res.json();
    if (data.success) setCalendarDateTasks(data.data);
  };

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTask = async (taskData: any) => {
    setLoading(true);
    const res = await apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(taskData) });
    const data = await res.json();
    if (data.success) await fetchDashboardData();
    setLoading(false);
  };

  const handleCompleteTask = async (id: string) => {
    setLoading(true);
    await apiFetch(`/api/tasks/${id}?actualTimeSpent=25`, { method: 'PUT' });
    await fetchDashboardData();
    setLoading(false);
  };

  const handleDeleteTask = async (id: string) => {
    setLoading(true);
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await fetchDashboardData();
    setLoading(false);
  };

  const handleApplySuggestion = async (id: string) => {
    setLoading(true);
    await apiFetch(`/api/suggestions/${id}`, { method: 'PUT' });
    await fetchDashboardData();
    setLoading(false);
  };

  const handleRejectSuggestion = async (id: string) => {
    setLoading(true);
    await apiFetch(`/api/suggestions/${id}`, { method: 'DELETE' });
    await fetchDashboardData();
    setLoading(false);
  };

  const handleApplyAllSuggestions = async () => {
    setLoading(true);
    await Promise.all(suggestions.map(s => apiFetch(`/api/suggestions/${s._id as any}`, { method: 'PUT' })));
    await fetchDashboardData();
    setLoading(false);
  };

  const handleFocusSessionComplete = async (durationSeconds: number) => {
    const targetTask = tasks.find(t => t.status === 'pending');
    await apiFetch('/api/focus', {
      method: 'POST',
      body: JSON.stringify({ duration: durationSeconds, completed: true, taskId: targetTask?._id }),
    });
    await fetchDashboardData();
  };

  const handleForceOptimizer = async () => {
    setLoading(true);
    await apiFetch('/api/suggestions', { method: 'POST' });
    await fetchDashboardData();
    setLoading(false);
  };

  const handleCalendarDateSelect = async (date: Date) => {
    setSelectedCalendarDate(date);
    await fetchTasksForDate(date);
  };

  const dismissMissedAlert = (id: string) => setMissedAlerts(prev => prev.filter(a => a.id !== id));

  const renderContentView = () => {
    switch (activeTab) {
      case 'My Tasks':
        return (
          <div className="space-y-6 animate-fade-in max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TaskList tasks={tasks} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onCreate={handleCreateTask} loading={loading} />
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><FolderOpen className="h-4 w-4 text-indigo-500" /> Category Breakdown</h3>
                <div className="space-y-4">
                  {['academic', 'work', 'personal', 'other'].map(cat => {
                    const catTasks = tasks.filter(t => t.category === cat);
                    const completed = catTasks.filter(t => t.status === 'completed').length;
                    const percent = catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="capitalize">{cat}</span>
                          <span>{completed}/{catTasks.length} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${percent}%` }} className="bg-indigo-600 h-full rounded-full transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Calendar':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <CalendarWidget onDateSelect={handleCalendarDateSelect} selectedDate={selectedCalendarDate} tasks={tasks} />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">
                  {selectedCalendarDate
                    ? `Tasks for ${selectedCalendarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : 'Upcoming Tasks'}
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">
                  {selectedCalendarDate ? 'Click another date to browse history' : 'Select a date to view task history'}
                </p>
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {(selectedCalendarDate ? calendarDateTasks : tasks.filter(t => t.status !== 'completed')).map(t => (
                    <div key={t._id as any} className={`flex items-center justify-between p-3 border rounded-xl ${t.status === 'overdue' ? 'border-rose-100 bg-rose-50/20' : 'border-slate-50 bg-slate-50/20'}`}>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{t.title}</span>
                        <span className={`text-[10px] capitalize font-medium ${t.status === 'overdue' ? 'text-rose-500' : 'text-slate-400'}`}>{t.category} • {t.status}</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600">
                        {new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {selectedCalendarDate && calendarDateTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">No tasks for this date.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'Smart Reschedule':
        return (
          <div className="space-y-6 animate-fade-in pb-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <h2 className="font-extrabold text-xl text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-indigo-500" /> AI Optimization Hub
                </h2>
                <p className="text-xs text-slate-400">
                  GhostTask detects missed and overdue tasks and suggests intelligent reschedule times.
                </p>
              </div>
              <button onClick={handleForceOptimizer} disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition shadow-md shadow-indigo-600/10 flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Run Smart Engine
              </button>
            </div>

            {missedAlerts.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
                <h3 className="font-bold text-sm text-rose-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Missed Tasks Requiring Attention
                </h3>
                <div className="space-y-3">
                  {missedAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-rose-100">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                        <p className="text-[10px] text-rose-500 mt-0.5">
                          Was due: {new Date(alert.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button onClick={() => dismissMissedAlert(alert.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-rose-400 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RescheduleSuggestions suggestions={suggestions} onApply={handleApplySuggestion} onReject={handleRejectSuggestion} onApplyAll={handleApplyAllSuggestions} loading={loading} />
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800">How AI Reschedule Works</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  GhostTask automatically detects tasks past their due date and generates optimized reschedule suggestions. When you accept a suggestion, the task's due date updates and the missed status is cleared.
                </p>
                <div className="p-3 bg-indigo-50/30 border border-indigo-50 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-600 block mb-1">Smart Timing</span>
                  <span className="text-xs text-slate-600 leading-normal">Suggestions default to 9–12 AM slots which align with peak productivity windows.</span>
                </div>
                <div className="p-3 bg-amber-50/30 border border-amber-50 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-600 block mb-1">Missed Tasks: {missedAlerts.length}</span>
                  <span className="text-xs text-slate-600 leading-normal">Tasks are flagged as overdue when their due time passes without completion.</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Statistics':
        return (
          <div className="space-y-8 animate-fade-in pb-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProductivityOverview score={stats.productivityScore} chartData={stats.chartData} />
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-800 text-sm">Analytics Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Completion</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{stats.completionRate}%</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Score</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{stats.productivityScore}</span>
                  </div>
                </div>
              </div>
            </div>
            <RecentActivity activities={activities} />
          </div>
        );

      case 'Focus Mode':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in pb-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <div className="lg:col-span-4 h-full">
              <FocusTimer onSessionComplete={handleFocusSessionComplete} />
            </div>
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
              <h2 className="font-extrabold text-lg text-slate-800">Focus Session Goals</h2>
              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {tasks.filter(t => t.status === 'pending').map(t => (
                  <div key={t._id as any} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/20 hover:bg-slate-50/60 rounded-xl transition cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">{t.title}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 border border-slate-100 rounded bg-white">{t.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-2xl animate-fade-in">
            <h2 className="font-extrabold text-lg text-slate-800 flex items-center gap-1.5"><SettingsIcon className="h-5 w-5 text-indigo-500" /> Platform Settings</h2>
            <p className="text-xs text-slate-400 mt-1">Account-level configuration for {user?.name || 'your workspace'}.</p>
            <div className="border-t border-slate-100 my-6 pt-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Database className="h-4 w-4 text-indigo-500" /> Database Status</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">{dbStatus}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">Operational</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-800">Account</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">{user?.email}</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Data Isolation</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Your tasks are private and linked to your account only.</span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-3 py-1.5 rounded-xl">✓ Enabled</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-6">
            <div className="lg:col-span-5 space-y-6">
              <div className="h-[430px]"><TaskList tasks={tasks} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onCreate={handleCreateTask} loading={loading} /></div>
              <div className="h-[210px]"><RecentActivity activities={activities} /></div>
            </div>
            <div className="lg:col-span-4 h-[660px]">
              <RescheduleSuggestions suggestions={suggestions} onApply={handleApplySuggestion} onReject={handleRejectSuggestion} onApplyAll={handleApplyAllSuggestions} loading={loading} />
            </div>
            <div className="lg:col-span-3 space-y-6 max-h-[660px] overflow-y-auto pr-1">
              <CalendarWidget onDateSelect={handleCalendarDateSelect} selectedDate={selectedCalendarDate} tasks={tasks} />
              <FocusTimer onSessionComplete={handleFocusSessionComplete} />
              <ProductivityOverview score={stats.productivityScore} chartData={stats.chartData} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA] font-sans">
      <Sidebar autoReschedule={autoReschedule} onToggleAutoReschedule={() => setAutoReschedule(!autoReschedule)} activeItem={activeTab} setActiveItem={setActiveTab} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-10 py-5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'there'}! <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Stay productive — your tasks are waiting!</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search tasks..." className="w-full bg-slate-50 border-0 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-100 transition-all" />
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition flex items-center justify-center"
              >
                <Bell className="h-4 w-4" />
                {missedAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-indigo-500" /> Notifications
                    </span>
                    {missedAlerts.length > 0 && (
                      <span className="bg-rose-50 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-full">{missedAlerts.length} missed</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {missedAlerts.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">All caught up!</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">No missed tasks right now.</p>
                      </div>
                    ) : (
                      missedAlerts.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition border-b border-slate-50/60 last:border-0">
                          <div className="p-1.5 bg-rose-50 rounded-lg mt-0.5">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{alert.title}</p>
                            <p className="text-[10px] text-rose-500 mt-0.5">
                              Missed: {new Date(alert.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">{alert.category}</p>
                          </div>
                          <button onClick={() => dismissMissedAlert(alert.id)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {missedAlerts.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-50">
                      <button onClick={() => { setActiveTab('Smart Reschedule'); setShowNotifications(false); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition">
                        View Reschedule Suggestions →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-indigo-600/10 shadow-sm">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-800 leading-none flex items-center gap-1">
                    {user?.name || 'User'} <ChevronDown className="h-3 w-3 text-slate-400" />
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 capitalize">{user?.role || 'member'}</span>
                </div>
              </div>
              {onLogout && (
                <button onClick={onLogout} className="text-[10px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 border border-rose-100/50 px-3 py-2 rounded-xl transition cursor-pointer">
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <main className="flex-1 p-10 space-y-6 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
            {activeTab === 'Dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                {[
                  { label: 'Total Tasks', value: stats.totalTasks, sub: 'All tasks', color: 'indigo', Icon: Layers },
                  { label: 'Completed', value: stats.completedTasks, sub: `${stats.completionRate}% done`, color: 'emerald', Icon: CheckCircle2 },
                  { label: 'Pending', value: stats.pendingTasks, sub: 'In progress', color: 'amber', Icon: TrendingUp },
                  { label: 'Overdue', value: stats.overdueTasks, sub: 'Need reschedule', color: 'rose', Icon: AlertTriangle },
                ].map(({ label, value, sub, color, Icon }) => (
                  <div key={label} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
                    <div className={`bg-${color}-50 p-2 rounded-xl text-${color}-600`}><Icon className="h-4 w-4" /></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                      <span className="text-xl font-black text-slate-800 mt-0.5">{value}</span>
                      <span className={`text-[9px] font-bold text-${color}-500 mt-0.5`}>{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden">{renderContentView()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
