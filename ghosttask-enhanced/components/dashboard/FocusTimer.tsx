'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award, Check } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete: (durationSeconds: number) => Promise<void>;
}

export default function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [sessionLogged, setSessionLogged] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleComplete = async () => {
    setIsActive(false);
    setSessionLogged(true);
    // Log a full 25 min session (1500s)
    await onSessionComplete(1500);
    setTimeout(() => setSessionLogged(false), 3000);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(1500);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((1500 - secondsRemaining) / 1500) * 100;

  return (
    <div className={`bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-between h-full shadow-sm relative transition-all duration-300 ${isActive ? 'focus-glow-active border-indigo-200' : ''}`}>
      {/* Header title */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-indigo-400' : 'bg-slate-400'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-indigo-600' : 'bg-slate-500'}`} />
          </span>
          Focus Mode
        </h2>
        <button onClick={resetTimer} className="text-slate-400 hover:text-slate-600 transition">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Clock Graphic with live timer */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 w-full relative">
        {/* Minimal Circle Progress bar */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#6366f1"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-800">{formatTime(secondsRemaining)}</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Focus Session</span>
          </div>
        </div>

        {/* Mascot illustrations placeholder / status */}
        {sessionLogged && (
          <div className="absolute top-2 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100 shadow-sm animate-bounce">
            <Award className="h-3.5 w-3.5" /> Session recorded +25m!
          </div>
        )}
      </div>

      {/* Control button */}
      <div className="w-full mt-4 flex gap-2">
        <button
          onClick={toggleTimer}
          className={`flex-1 font-bold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer shadow-md ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 fill-white" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={handleComplete}
            className="px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition flex items-center justify-center shadow-md shadow-emerald-500/10"
            title="Complete early"
          >
            <Check className="h-4 w-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
}
