'use client';

import React, { useState } from 'react';
import { ITask } from '@/models/Task';
import { Check, Plus, AlertCircle, Trash2, FolderPlus, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: ITask[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (taskData: {
    title: string;
    priority: 'low' | 'medium' | 'high';
    category: 'academic' | 'personal' | 'work' | 'other';
    dueDate: string;
    estimatedTime: number;
  }) => Promise<void>;
  loading: boolean;
}

export default function TaskList({ tasks, onComplete, onDelete, onCreate, loading }: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'academic' | 'personal' | 'work' | 'other'>('personal');
  const [time, setTime] = useState('12:00');
  const [estimatedTime, setEstimatedTime] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Construct full date ISO
    const dateStr = new Date().toISOString().split('T')[0];
    const fullDueDate = `${dateStr}T${time}:00.000Z`;

    await onCreate({
      title,
      priority,
      category,
      dueDate: fullDueDate,
      estimatedTime,
    });

    setTitle('');
    setIsAdding(false);
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'academic':
        return 'bg-indigo-500';
      case 'work':
        return 'bg-sky-500';
      default:
        return 'bg-teal-500';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col h-full shadow-sm relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="font-extrabold text-lg text-slate-800">Today's Tasks</h2>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {tasks.filter((t) => t.status !== 'completed').length} due today
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition flex items-center gap-1"
        >
          {isAdding ? 'Cancel' : <><Plus className="h-3.5 w-3.5" /> Quick Add</>}
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 animate-fade-in">
          <input
            type="text"
            required
            placeholder="Task title (e.g. Finish Project Report)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Due Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Est. Duration (Mins)</label>
              <input
                type="number"
                value={estimatedTime}
                min={1}
                max={480}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10"
          >
            <FolderPlus className="h-4 w-4" /> Save Task
          </button>
        </form>
      )}

      {/* Task List Items */}
      <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[480px] pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
            <p className="font-semibold text-sm">No tasks remaining for today!</p>
            <p className="text-xs text-slate-400 mt-0.5">Enjoy your free time or add a new goal.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = task.status === 'overdue';
            const dueFormatted = new Date(task.dueDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={task._id as any}
                className={`task-card-transition p-4 rounded-2xl border flex items-center justify-between ${
                  isCompleted 
                    ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                    : isOverdue
                    ? 'border-rose-100 bg-rose-50/10'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Task Checkbox */}
                  <button
                    onClick={() => !isCompleted && onComplete(task._id as any)}
                    disabled={isCompleted}
                    className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500 bg-white'
                    }`}
                  >
                    {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>

                  {/* Task Info */}
                  <div className="flex flex-col space-y-1">
                    <span className={`text-sm font-bold tracking-tight text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Category circle & name */}
                      <span className={`h-2 w-2 rounded-full ${getCategoryColor(task.category)}`} />
                      <span className="text-[10px] font-bold text-slate-400 capitalize">{task.category}</span>
                      
                      {/* Priority tag */}
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side options: time & trash */}
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="flex items-center space-x-1 text-xs">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className={`font-semibold ${isCompleted ? 'text-emerald-500' : isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                      {isCompleted ? 'Completed' : dueFormatted}
                    </span>
                  </div>
                  <button
                    onClick={() => onDelete(task._id as any)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
