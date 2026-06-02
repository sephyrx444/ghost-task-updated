'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ITask } from '@/models/Task';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  tasks?: ITask[];
}

export default function CalendarWidget({ onDateSelect, selectedDate, tasks = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      const d = new Date(t.dueDate);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isFutureDate = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d > today;
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect?.(clicked);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-full shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4 text-indigo-500" /> Calendar
        </h2>
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-bold text-slate-600">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <div className="flex items-center space-x-1">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="mb-3 px-2 py-1.5 bg-indigo-50 rounded-xl">
          <p className="text-[10px] font-bold text-indigo-600">
            Viewing: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
        {daysOfWeek.map(day => (
          <span key={day} className="text-[10px] uppercase font-bold text-slate-400">{day}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <span key={`empty-${i}`} className="text-xs py-1.5 text-transparent select-none">-</span>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
          const isSelected = isSelectedDay(day);
          const dayTasks = getTasksForDay(day);
          const hasTask = dayTasks.length > 0;
          const hasOverdue = dayTasks.some(t => t.status === 'overdue');
          const isPast = !isFutureDate(day) && !isToday;

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDayClick(day)}
              className={`text-xs font-bold py-1.5 rounded-xl cursor-pointer relative transition duration-150 flex items-center justify-center
                ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' :
                  isSelected ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400' :
                  isPast ? 'text-slate-400 hover:bg-slate-50' :
                  'text-slate-700 hover:bg-slate-50'}`}
            >
              {day}
              {hasTask && !isToday && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${hasOverdue ? 'bg-rose-500' : 'bg-indigo-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-3">Click any date to view its tasks</p>
    </div>
  );
}
