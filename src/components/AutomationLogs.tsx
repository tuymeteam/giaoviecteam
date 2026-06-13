import { BotLog } from '../types';
import { Bot, Mail, Send, Calendar, Terminal, Power, Database, Cpu, CheckCircle } from 'lucide-react';

interface AutomationLogsProps {
  logs: BotLog[];
  botEnabled: boolean;
  onToggleBot: () => void;
}

export default function AutomationLogs({ logs, botEnabled, onToggleBot }: AutomationLogsProps) {
  return (
    <div id="automation-logs-container" className="space-y-4 animate-in fade-in duration-200">
      {/* Bot Configuration Card */}
      <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-xl ${botEnabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">BOT: Notify New Task Assignee</h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-tight">AppSheet Automation System</p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <button
            type="button"
            id="toggle-bot-btn"
            onClick={onToggleBot}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              botEnabled 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{botEnabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}</span>
          </button>
        </div>

        {/* Bot rules structure visualizer */}
        <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-1 text-indigo-400 font-mono text-[10.5px] font-bold">
            <Database className="w-3.5 h-3.5" /> <span>CẤU HÌNH AUTOMATION BOT</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-1 font-medium">
            <div className="p-2 bg-slate-950/70 border border-slate-850 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase font-mono">1. Sự kiện (Trigger)</p>
              <p className="text-slate-200 font-bold mt-0.5">Thêm Công Việc Mới</p>
              <p className="text-[9px] text-indigo-400 mt-1 font-mono">[Sự kiện] = NEW_RECORD</p>
            </div>
            <div className="p-2 bg-slate-950/70 border border-slate-850 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase font-mono">2. Điều kiện</p>
              <p className="text-slate-200 font-bold mt-0.5">Không điều kiện</p>
              <p className="text-[9px] text-slate-600 mt-1 font-mono">Luôn luôn chạy</p>
            </div>
            <div className="p-2 bg-slate-950/70 border border-slate-850 rounded-lg text-indigo-400">
              <p className="text-[10px] text-slate-500 uppercase font-mono">3. Hành động (Action)</p>
              <p className="text-indigo-400 font-bold mt-0.5 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1" /> Gửi Email
              </p>
              <p className="text-[9px] text-indigo-400/80 mt-1 font-mono">đến [Người được giao]</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Logs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center">
            <Terminal className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Nhật ký Gửi Email Tự động
          </h4>
          <span className="text-[10px] bg-slate-950 border border-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
            Tổng cộng: {logs.length} emails
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center bg-slate-950 border border-slate-900 rounded-xl text-slate-500 text-xs italic font-medium">
            Chưa có dòng nhật ký gửi email nào. Bot đang sẳn sàng hoạt động!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {logs.slice().reverse().map((log) => (
              <div 
                key={log.id}
                id={`bot-log-item-${log.id}`} 
                className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2 text-xs"
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-900">
                  <div className="flex items-center space-x-1.5 text-indigo-400 font-bold font-mono">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{log.id}</span>
                  </div>
                  <span className="text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Sender/Receiver details */}
                <div className="space-y-0.5 font-medium">
                  <p className="text-slate-400">
                    <strong className="text-slate-500 font-mono text-[10px] uppercase mr-1">Người nhận:</strong>
                    <span className="text-sky-400 font-mono">{log.receiverEmail}</span>
                  </p>
                  <p className="text-slate-200 mt-1" id={`log-subject-${log.id}`}>
                    <strong className="text-slate-500 font-mono text-[10px] uppercase mr-1">Tiêu đề:</strong>
                    {log.subject}
                  </p>
                </div>

                {/* Email Body content */}
                <div className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg text-slate-400 font-medium font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto">
                  {log.body}
                </div>

                {/* Delivery status indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1">
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Đã chuyển giao thành công (Delivered)
                  </div>
                  <span className="font-mono bg-slate-900 px-1.5 py-0.2 rounded border border-slate-850">
                    SMTP Mailer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
