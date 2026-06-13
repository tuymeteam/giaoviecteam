import { useState } from 'react';
import { Task, TaskStatus, TaskPriority, UserPersona } from '../types';
import { ChevronRight, ChevronDown, Calendar, Paperclip, Mail, Shield, AlertCircle, Clock, Eye, Edit2 } from 'lucide-react';

interface GroupedViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  currentPersona: UserPersona;
}

export default function GroupedView({ tasks, onEditTask, currentPersona }: GroupedViewProps) {
  // Mobile lists expand state
  const [expandedGroups, setExpandedGroups] = useState<Record<TaskStatus, boolean>>({
    [TaskStatus.NOT_STARTED]: true,
    [TaskStatus.IN_PROGRESS]: true,
    [TaskStatus.AWAITING_APPROVAL]: true,
    [TaskStatus.COMPLETED]: false,
    [TaskStatus.PAUSED]: false,
  });

  // Kanban view toggle (landscape / wide screen optimized)
  const [isKanbanLayout, setIsKanbanLayout] = useState(false);

  const toggleGroup = (status: TaskStatus) => {
    setExpandedGroups(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Group tasks by status
  const groupedTasks = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Helper styles
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case TaskPriority.MEDIUM:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case TaskPriority.LOW:
        default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NOT_STARTED: return 'border-l-slate-400 text-slate-400';
      case TaskStatus.IN_PROGRESS: return 'border-l-sky-400 text-sky-400';
      case TaskStatus.AWAITING_APPROVAL: return 'border-l-violet-400 text-violet-400';
      case TaskStatus.COMPLETED: return 'border-l-emerald-400 text-emerald-400';
      case TaskStatus.PAUSED: return 'border-l-amber-500 text-amber-500';
    }
  };

  const getDueDateStatus = (dueDateStr: string, status: TaskStatus) => {
    if (status === TaskStatus.COMPLETED) {
      return { label: 'Đã hoàn thành', bg: 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10' };
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0,0,0,0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Quá hạn ${Math.abs(diffDays)} ngày`, bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' };
    } else if (diffDays === 0) {
      return { label: 'Hết hạn hôm nay', bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    } else if (diffDays === 1) {
      return { label: 'Hạn ngày mai', bg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' };
    } else {
      return { label: `Hạn ${dueDateStr}`, bg: 'bg-slate-950 text-slate-400 border border-slate-800' };
    }
  };

  // Render a single task card
  const TaskCard = ({ task }: { task: Task; key?: string }) => {
    const dueDateInfo = getDueDateStatus(task.dueDate, task.status);
    const isAdmin = currentPersona.role === 'Admin';
    const isAssignedToMe = task.assignee === currentPersona.email;
    const canModifyOnlyStatus = !isAdmin && isAssignedToMe;

    return (
      <div 
        id={`task-card-${task.id}`}
        onClick={() => onEditTask(task)}
        className={`bg-slate-900 border border-slate-800/85 hover:border-slate-700/80 p-3.5 rounded-xl transition shadow-sm active:scale-[0.99] cursor-pointer flex flex-col space-y-2.5 border-l-4 ${getStatusColor(task.status)}`}
      >
        {/* Row 1: ID, Priority, canEdit indicator */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono text-slate-500 font-semibold">{task.id}</span>
          <div className="flex items-center space-x-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityBadge(task.priority)}`}>
              Ưu tiên: {task.priority}
            </span>
            {isAdmin ? (
              <span className="text-amber-500 font-bold text-[9px] bg-amber-500/5 px-1.5 py-0.5 rounded-md flex items-center">
                <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
              </span>
            ) : isAssignedToMe ? (
              <span className="text-sky-500 font-bold text-[9px] bg-sky-500/5 px-1.5 py-0.5 rounded-md flex items-center">
                <Edit2 className="w-2.5 h-2.5 mr-0.5" /> Trạng thái
              </span>
            ) : (
              <span className="text-slate-500 text-[9px] bg-slate-950 px-1.5 py-0.5 rounded-md flex items-center">
                <Eye className="w-2.5 h-2.5 mr-0.5" /> Xem
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Title */}
        <div>
          <h4 className="text-slate-200 font-bold text-sm tracking-tight leading-snug">{task.title}</h4>
          {task.detail && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.detail}
            </p>
          )}
        </div>

        {/* Row 3: Assignee & File Attachment */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium truncate max-w-[70%]">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate font-mono text-[11px]">
              {task.assignee === currentPersona.email ? 'giao cho tôi' : task.assignee.split('@')[0]}
            </span>
          </div>
          
          {task.attachmentName && (
            <div className="flex items-center space-x-1 text-[11px] text-sky-400 font-medium shrink-0">
              <Paperclip className="w-3 h-3" />
              <span className="max-w-[80px] truncate" title={task.attachmentName}>{task.attachmentName}</span>
            </div>
          )}
        </div>

        {/* Row 4: Due Date */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <div className="flex items-center text-slate-500 font-mono text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            <span>Giao bởi: {task.assignor.split('@')[0]}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${dueDateInfo.bg}`}>
            {dueDateInfo.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div id="grouped-view-section" className="space-y-4">
      {/* View layout Toggle (List vs Kanban) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Phân nhóm theo Trạng thái (Grouped View)
        </h3>
        <button
          type="button"
          id="toggle-layout-btn"
          onClick={() => setIsKanbanLayout(!isKanbanLayout)}
          className="p-1.5 px-3 bg-slate-900 border border-slate-800 text-xs text-sky-400 font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          {isKanbanLayout ? 'Xem Dạng Danh Sách (Mobile)' : 'Xem Dạng Cột Kanban'}
        </button>
      </div>

      {isKanbanLayout ? (
        /* Landscape / Wide screen Optimized Horizontal columns */
        <div id="kanban-columns" className="flex space-x-3 overflow-x-auto pb-4 snap-x select-none">
          {Object.values(TaskStatus).map((status) => {
            const list = groupedTasks[status];
            return (
              <div 
                key={status} 
                className="w-72 shrink-0 bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col max-h-[70vh] snap-center"
              >
                {/* Header status bar */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-850">
                  <span className="text-xs font-bold text-slate-200 flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                      status === TaskStatus.COMPLETED ? 'bg-emerald-400' :
                      status === TaskStatus.IN_PROGRESS ? 'bg-sky-400' :
                      status === TaskStatus.AWAITING_APPROVAL ? 'bg-violet-400' :
                      status === TaskStatus.PAUSED ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    {status}
                  </span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full font-mono">
                    {list.length}
                  </span>
                </div>

                {/* Cards container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {list.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-medium">
                      Không có công việc nào
                    </div>
                  ) : (
                    list.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile-First optimized Collapsible Vertical Accordion Groups */
        <div id="accordion-groups" className="space-y-2.5">
          {Object.values(TaskStatus).map((status) => {
            const list = groupedTasks[status];
            const isExpanded = expandedGroups[status];
            
            return (
              <div 
                key={status}
                className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden"
              >
                {/* Group Accordion Header */}
                <button
                  id={`accordion-btn-${status.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => toggleGroup(status)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 text-slate-200 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    
                    {/* Status Dot indexer */}
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      status === TaskStatus.COMPLETED ? 'bg-emerald-400' :
                      status === TaskStatus.IN_PROGRESS ? 'bg-sky-400' :
                      status === TaskStatus.AWAITING_APPROVAL ? 'bg-violet-400' :
                      status === TaskStatus.PAUSED ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    
                    <span className="text-[13px] font-bold tracking-tight text-slate-100">{status}</span>
                  </div>
                  
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold font-mono">
                    {list.length} công việc
                  </span>
                </button>

                {/* Group tasks box */}
                {isExpanded && (
                  <div className="p-3 bg-slate-950 space-y-2.5 border-t border-slate-900 max-h-[350px] overflow-y-auto">
                    {list.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">
                        Không có công việc nào trong thư mục này
                      </p>
                    ) : (
                      list.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
