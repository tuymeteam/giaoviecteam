import { Task, TaskStatus, TaskPriority, UserPersona } from '../types';
import { Mail, Calendar, Play, Check, Send, AlertTriangle, FileText, Pause } from 'lucide-react';

interface MyTasksViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onQuickUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  currentPersona: UserPersona;
}

export default function MyTasksView({ tasks, onEditTask, onQuickUpdateStatus, currentPersona }: MyTasksViewProps) {
  // Slice filtering row condition: [Người được giao] = USEREMAIL()
  const myTasks = tasks.filter(t => t.assignee === currentPersona.email);

  // Status breakdown specifically for current logged-in employee view
  const pendingCount = myTasks.filter(t => t.status === TaskStatus.NOT_STARTED || t.status === TaskStatus.PAUSED).length;
  const inProgressCount = myTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const approvingCount = myTasks.filter(t => t.status === TaskStatus.AWAITING_APPROVAL).length;
  const completedCount = myTasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case TaskPriority.MEDIUM: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case TaskStatus.IN_PROGRESS:
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case TaskStatus.AWAITING_APPROVAL:
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case TaskStatus.PAUSED:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-900 text-slate-400 border border-slate-800';
    }
  };

  return (
    <div id="mytasks-slice-container" className="space-y-4">
      {/* Slice Info Cards */}
      <div className="p-3.5 bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-900/30 rounded-2xl">
        <div className="flex items-center space-x-1.5 mb-1 text-sky-400 font-mono text-[11px] font-bold">
          <span>SLICE:</span>
          <span className="bg-sky-500/10 px-1.5 py-0.2 rounded text-[10px] text-sky-300">
            [Người được giao] = USEREMAIL()
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-100">Lát cắt: Việc của tôi</h3>
        <p className="text-xs text-slate-400 mt-1 leading-normal">
          Bộ lọc thông minh giúp bạn chỉ tập trung vào các công việc được giao trực tiếp cho <strong className="text-slate-200">{currentPersona.email}</strong>, giảm thiểu quá tải thông tin hệ thống.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-950 border border-slate-900 p-2 rounded-xl">
          <p className="text-xs text-slate-500 font-bold leading-none">Chưa làm</p>
          <p className="text-base font-mono font-extrabold text-slate-300 mt-1.5">{pendingCount}</p>
        </div>
        <div className="bg-slate-950 border border-slate-900 p-2 rounded-xl">
          <p className="text-xs text-slate-500 font-bold leading-none">Đang làm</p>
          <p className="text-base font-mono font-extrabold text-sky-400 mt-1.5">{inProgressCount}</p>
        </div>
        <div className="bg-slate-950 border border-slate-900 p-2 rounded-xl">
          <p className="text-xs text-slate-500 font-bold leading-none">Chờ duyệt</p>
          <p className="text-base font-mono font-extrabold text-violet-400 mt-1.5">{approvingCount}</p>
        </div>
        <div className="bg-slate-950 border border-slate-900 p-2 rounded-xl">
          <p className="text-xs text-slate-500 font-bold leading-none">Hoàn thành</p>
          <p className="text-base font-mono font-extrabold text-emerald-400 mt-1.5">{completedCount}</p>
        </div>
      </div>

      {/* Slice Task List */}
      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 border border-slate-900 rounded-xl space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">Tuyệt vời! Bạn không có việc nào đang chờ xử lý.</p>
            <p className="text-[10px] text-slate-500">Mọi công việc của bạn đã được giải quyết hoặc chưa được giao mới.</p>
          </div>
        ) : (
          myTasks.map((t) => {
            const isHigh = t.priority === TaskPriority.HIGH;
            
            return (
              <div 
                key={t.id}
                id={`task-slice-row-${t.id}`}
                className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3 hover:border-slate-800 transition"
              >
                {/* Header info */}
                <div 
                  onClick={() => onEditTask(t)}
                  className="flex items-start justify-between cursor-pointer"
                >
                  <div className="space-y-1 pr-2 max-w-[75%]">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{t.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 hover:text-sky-400 transition leading-snug">{t.title}</h4>
                    {t.detail && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-normal font-medium">{t.detail}</p>
                    )}
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(t.status)} shrink-0`}>
                    {t.status}
                  </span>
                </div>

                {/* Date & Attachments line */}
                <div 
                  onClick={() => onEditTask(t)}
                  className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 cursor-pointer"
                >
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> Hạn: {t.dueDate}
                  </span>
                  
                  {t.attachmentName && (
                    <span className="text-sky-400 truncate max-w-[120px] font-bold hover:underline">
                      📎 {t.attachmentName}
                    </span>
                  )}
                </div>

                {/* Quick Status Workflow Controller for employees */}
                <div className="pt-2.5 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight font-mono">
                    Thao tác nhanh
                  </span>
                  
                  <div className="flex space-x-1.5">
                    {t.status === TaskStatus.NOT_STARTED && (
                      <button
                        type="button"
                        id={`quick-start-btn-${t.id}`}
                        onClick={() => onQuickUpdateStatus(t.id, TaskStatus.IN_PROGRESS)}
                        className="p-1 px-2.5 bg-sky-500 text-slate-950 hover:brightness-110 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Bắt đầu làm</span>
                      </button>
                    )}

                    {t.status === TaskStatus.IN_PROGRESS && (
                      <>
                        <button
                          type="button"
                          id={`quick-pause-btn-${t.id}`}
                          onClick={() => onQuickUpdateStatus(t.id, TaskStatus.PAUSED)}
                          className="p-1 px-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg text-[10.5px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Tạm dừng</span>
                        </button>
                        <button
                          type="button"
                          id={`quick-submit-btn-${t.id}`}
                          onClick={() => onQuickUpdateStatus(t.id, TaskStatus.AWAITING_APPROVAL)}
                          className="p-1 px-2.5 bg-violet-600 text-white hover:brightness-110 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Gửi trình duyệt</span>
                        </button>
                      </>
                    )}

                    {t.status === TaskStatus.PAUSED && (
                      <button
                        type="button"
                        id={`quick-resume-btn-${t.id}`}
                        onClick={() => onQuickUpdateStatus(t.id, TaskStatus.IN_PROGRESS)}
                        className="p-1 px-3 bg-sky-500 text-slate-950 hover:brightness-110 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Tiếp tục làm</span>
                      </button>
                    )}

                    {t.status === TaskStatus.AWAITING_APPROVAL && (
                      <div className="text-[11px] text-violet-400/80 italic font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-1 animate-pulse" />
                        Chờ Admin Xét duyệt...
                      </div>
                    )}

                    {t.status === TaskStatus.COMPLETED && (
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Nhiệm vụ đã hoàn tất!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
