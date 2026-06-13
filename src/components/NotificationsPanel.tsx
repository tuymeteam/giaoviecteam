import { PushNotification, Task, TaskStatus } from '../types';
import { Bell, BellOff, Check, Trash, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: PushNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewTask: (taskId: string) => void;
}

export default function NotificationsPanel({ 
  notifications, 
  onMarkAsRead, 
  onClearAll, 
  onViewTask 
}: NotificationsPanelProps) {
  
  const readNotifications = notifications.filter(n => n.isRead);
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div id="notifications-panel-container" className="space-y-4 animate-in fade-in duration-200">
      
      {/* Push Notification Controls Info */}
      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Đồng bộ cảnh báo cận hạn:</span> Hệ thống quét tự động toàn bộ thời hạn công việc của bạn. Những việc cận hạn trong 24-48h sẽ tự động kích hoạt Cảnh báo Đẩy (Push Notifications) và ghi nhận nhật ký dưới đây.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center">
          <Bell className="w-4 h-4 mr-1.5 text-sky-400" /> Trung tâm Cảnh báo Đẩy
        </h3>
        {notifications.length > 0 && (
          <button
            type="button"
            id="clear-all-notifications-btn"
            onClick={onClearAll}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-bold hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 border border-slate-900 rounded-xl space-y-2.5">
          <BellOff className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Không có thông báo nào!</p>
          <p className="text-[10px] text-slate-600">Tuyệt vời. Hiện tại không có công việc nào quá hạn hoặc sắp đến hạn cần cảnh báo nợ.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              id={`push-notification-item-${n.id}`}
              className={`p-3.5 rounded-xl border transition flex items-start justify-between space-x-3 text-xs ${
                n.isRead 
                  ? 'bg-slate-950 border-slate-900/60 opacity-60 text-slate-400' 
                  : 'bg-slate-900 border-rose-500/30 text-slate-200'
              }`}
            >
              <div 
                onClick={() => onViewTask(n.taskId)}
                className="flex-1 space-y-1 cursor-pointer hover:text-slate-100"
              >
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${n.daysRemaining < 0 ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="font-extrabold text-[12px] text-slate-100">{n.taskTitle}</span>
                </div>
                <p className="leading-relaxed font-semibold">{n.message}</p>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">
                    {new Date(n.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(n.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 shrink-0">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  n.daysRemaining < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {n.daysRemaining < 0 ? 'QUÁ HẠN ⚠️' : 'CẬN HẠN ⏳'}
                </span>
                
                {!n.isRead && (
                  <button
                    type="button"
                    id={`mark-read-notification-${n.id}`}
                    onClick={() => onMarkAsRead(n.id)}
                    className="p-1 text-sky-400 hover:text-sky-300 font-bold border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 rounded"
                    title="Đổi thành đã đọc"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
