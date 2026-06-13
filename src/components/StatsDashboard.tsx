import { Task, TaskStatus, TaskPriority } from '../types';
import { Target, CheckCircle2, AlertCircle, Play, ShieldAlert } from 'lucide-react';

interface StatsDashboardProps {
  tasks: Task[];
  onCreateMockOverdue: () => void;
}

export default function StatsDashboard({ tasks, onCreateMockOverdue }: StatsDashboardProps) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.COMPLETED).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div id="stats-dashboard" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Welcome Stat Circle */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/70 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center leading-snug">
            Bảng Điều Khiển Việc
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Hệ thống quản lý Công việc được thiết kế theo tiêu chuẩn AppSheet & Glide di động cực kỳ mượt mà.
          </p>
          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              id="test-due-deadlines-btn"
              onClick={onCreateMockOverdue}
              className="text-[10px] bg-sky-500 text-slate-950 font-bold px-2 py-1 rounded-lg shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
              title="Nhấn để tạo công việc có hạn là Hôm Nay hoặc Đã Quá Hạn, giúp kích hoạt Cảnh báo Đẩy (Push Notification)"
            >
              ⚡ Tạo việc cận hạn (Test Báo Đẩy)
            </button>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-slate-800 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-sky-400 fill-none transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - completionRate / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-extrabold text-slate-100">{completionRate}%</span>
            <span className="text-[7px] text-slate-500 font-semibold tracking-wider font-mono">Xong</span>
          </div>
        </div>
      </div>

      {/* Grid numbers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stat 1 */}
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Tổng công việc</p>
            <p className="text-base font-mono font-bold text-slate-200 mt-0.5">{total}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Đã hoàn thành</p>
            <p className="text-base font-mono font-bold text-slate-200 mt-0.5">{completed}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg shrink-0">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Đang thực hiện</p>
            <p className="text-base font-mono font-bold text-slate-200 mt-0.5">{inProgress}</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center space-x-3">
          <div className={`p-2 rounded-lg shrink-0 ${highPriority > 0 ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-slate-900 text-slate-500'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Sự vụ ưu tiên cao</p>
            <p className={`text-base font-mono font-bold mt-0.5 ${highPriority > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}`}>{highPriority}</p>
          </div>
        </div>
      </div>

      {/* Security Quick Explainer card */}
      <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
        <h4 className="text-xs font-bold text-slate-300 flex items-center">
          <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Cửa Sổ Phân Quyền Thông Minh
        </h4>
        <p className="text-[11px] text-slate-500 leading-normal font-medium">
          Xem và chỉnh sửa các dòng công việc theo phân chia thứ tự quyền lực cấu hình. Khi chuyển đổi các đại diện User bằng thanh menu ở đầu trang, các View sẽ tự biến đổi phù hợp với quyền hạn của tài khoản đó.
        </p>
      </div>

    </div>
  );
}
