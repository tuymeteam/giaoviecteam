import { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Clock, Eye, MapPin } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export default function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  // Current visible month/year state
  const [currentDate, setCurrentDate] = useState(() => {
    // Start with current date (June 2026 based on metadata or current year)
    const initDate = new Date();
    // Override with current metadata year if needed (2026-06-11)
    initDate.setFullYear(2026);
    initDate.setMonth(5); // June is month index 5 (0-indexed)
    return initDate;
  });

  // Selected date state to view tasks on that date (defaults to today or June 11, 2026)
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-11');

  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const VN_MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const VN_WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day weekday offset (adjusted to start on Monday)
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  const getFirstDayOffset = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    // Adjust Sunday (0) to index 6, Monday (1) to index 0...
    return day === 0 ? 6 : day - 1;
  };

  const totalDays = getDaysInMonth(currentYear, currentMonthIndex);
  const startOffset = getFirstDayOffset(currentYear, currentMonthIndex);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  // Format date parts to string: YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Get tasks due on a specific YYYY-MM-DD
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  // Calendar cells generation
  const cells: { dayNum: number | null; dateStr: string | null }[] = [];
  
  // Empty offset slots
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dayNum: null, dateStr: null });
  }
  
  // Real month days
  for (let day = 1; day <= totalDays; day++) {
    cells.push({
      dayNum: day,
      dateStr: formatDateString(currentYear, currentMonthIndex, day)
    });
  }

  const selectedDateTasks = selectedDateStr ? getTasksForDate(selectedDateStr) : [];

  return (
    <div id="calendar-view-container" className="space-y-4">
      {/* Calendar Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-sky-400 font-medium" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Lịch làm việc (Deadline View)
          </h3>
        </div>
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
          <button 
            type="button" 
            id="prev-month-btn"
            onClick={prevMonth} 
            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 px-2 font-mono min-w-[95px] text-center">
            {VN_MONTHS[currentMonthIndex]}, {currentYear}
          </span>
          <button 
            type="button" 
            id="next-month-btn"
            onClick={nextMonth} 
            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Calendar Body Widget */}
      <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl shadow-inner">
        {/* Week Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {VN_WEEKDAYS.map((wk) => (
            <div key={wk} className="text-[11px] font-bold text-slate-500 py-1 font-mono">{wk}</div>
          ))}
        </div>

        {/* Days Grid slots */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {cells.map((cell, index) => {
            if (!cell.dayNum || !cell.dateStr) {
              return <div key={`empty-${index}`} className="aspect-square opacity-0" />;
            }

            const dayTasks = getTasksForDate(cell.dateStr);
            const hasTasks = dayTasks.length > 0;
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = cell.dateStr === '2026-06-11'; // Metadata time is June 11, 2026

            // Task indicators colors
            const hasHighPriority = dayTasks.some(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.COMPLETED);
            const hasAwaitingApproval = dayTasks.some(t => t.status === TaskStatus.AWAITING_APPROVAL);

            let dotsColor = 'bg-sky-400';
            if (hasHighPriority) dotsColor = 'bg-rose-500 animate-pulse';
            else if (hasAwaitingApproval) dotsColor = 'bg-violet-400';
            else if (dayTasks.every(t => t.status === TaskStatus.COMPLETED)) dotsColor = 'bg-emerald-500';

            return (
              <button
                key={cell.dateStr}
                id={`calendar-day-${cell.dayNum}`}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr!)}
                className={`aspect-square flex flex-col justify-between items-center p-1.5 rounded-xl transition cursor-pointer relative ${
                  isSelected 
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20' 
                    : isToday
                      ? 'bg-slate-900 text-sky-400 border border-sky-500/20 font-bold'
                      : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                {/* Date Number Label */}
                <span className="text-[12px] font-mono leading-none">{cell.dayNum}</span>

                {/* Deadline indicators dots/badges */}
                {hasTasks && (
                  <div className="flex space-x-0.5 justify-center mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : dotsColor}`} />
                    {dayTasks.length > 1 && (
                      <span className={`text-[8px] font-bold font-mono leading-none ${isSelected ? 'text-slate-950' : 'text-slate-500'}`}>
                        +{dayTasks.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day task deadlines drawers */}
      <div id="calendar-day-detail" className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-850">
          <p className="text-xs font-semibold text-slate-300">
            Hạn công việc ngày: <span className="text-sky-400 font-mono font-bold tracking-tight">{selectedDateStr}</span>
          </p>
          <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-850 text-slate-400 rounded-full font-mono font-bold">
            {selectedDateTasks.length} nhiệm vụ
          </span>
        </div>

        {selectedDateTasks.length === 0 ? (
          <div className="py-5 text-center text-xs text-slate-500 font-medium italic">
            Không có công việc nào hết hạn trong ngày này.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {selectedDateTasks.map((t) => {
              const isHigh = t.priority === TaskPriority.HIGH;
              return (
                <div
                  key={t.id}
                  id={`calendar-sub-task-${t.id}`}
                  onClick={() => onEditTask(t)}
                  className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 truncate pr-2 max-w-[70%]">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        t.status === TaskStatus.COMPLETED ? 'bg-emerald-400' :
                        t.status === TaskStatus.IN_PROGRESS ? 'bg-sky-400' : 'bg-slate-400'
                      }`} />
                      <span className="text-slate-200 font-bold truncate leading-tight">{t.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      Giao cho: {t.assignee}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 font-bold text-[10px] shrink-0">
                    <span className={`px-1.5 py-0.5 rounded ${
                      isHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-900 text-slate-500 border border-slate-850'
                    }`}>
                      {t.priority}
                    </span>
                    <button className="text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/20">
                      Sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
