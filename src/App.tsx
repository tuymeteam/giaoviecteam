import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, UserPersona, BotLog, PushNotification } from './types';
import { INITIAL_TASKS, INITIAL_BOT_LOGS, USER_PERSONAS } from './data/initialData';
import RoleSwitcher from './components/RoleSwitcher';
import TaskForm from './components/TaskForm';
import GroupedView from './components/GroupedView';
import CalendarView from './components/CalendarView';
import MyTasksView from './components/MyTasksView';
import AutomationLogs from './components/AutomationLogs';
import NotificationsPanel from './components/NotificationsPanel';
import StatsDashboard from './components/StatsDashboard';

import { 
  CheckSquare, 
  Layers, 
  Calendar as CalendarIcon, 
  User, 
  Bot, 
  Bell, 
  PlusCircle, 
  Smartphone, 
  Info,
  ShieldAlert,
  Sliders,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grouped' | 'calendar' | 'my_tasks' | 'automation' | 'notifications'>('dashboard');

  // Currently logged in persona (USEREMAIL() abstraction)
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    const saved = localStorage.getItem('__task_persona');
    return saved ? JSON.parse(saved) : USER_PERSONAS[0]; // Default to Tranxuantuy2112@gmail.com (Admin)
  });

  // Core task list
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('__task_list');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Bot automation enablement state
  const [botEnabled, setBotEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('__bot_enabled');
    return saved !== 'false'; // defaults to true
  });

  // Bot logs queue
  const [botLogs, setBotLogs] = useState<BotLog[]>(() => {
    const saved = localStorage.getItem('__bot_logs');
    return saved ? JSON.parse(saved) : INITIAL_BOT_LOGS;
  });

  // Push notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  // IDs of notifications already marked read by user
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('__read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Task edit form states
  const [targetTask, setTargetTask] = useState<Task | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Desktop Simulator mode state (allows showcasing mobile layouts beautifully!)
  const [isSimulatorMode, setIsSimulatorMode] = useState(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('__task_persona', JSON.stringify(currentPersona));
  }, [currentPersona]);

  useEffect(() => {
    localStorage.setItem('__task_list', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('__bot_enabled', String(botEnabled));
  }, [botEnabled]);

  useEffect(() => {
    localStorage.setItem('__bot_logs', JSON.stringify(botLogs));
  }, [botLogs]);

  useEffect(() => {
    localStorage.setItem('__read_notifications', JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  // Scan deadlines and auto-trigger Push Notifications on load or list updates
  // High fidelity calculations relative to 'June 11, 2026' metadata baseline
  useEffect(() => {
    const today = new Date('2026-06-11');
    today.setHours(0,0,0,0);

    const generatedAlerts: PushNotification[] = [];

    tasks.forEach(task => {
      // Ignore completed tasks
      if (task.status === TaskStatus.COMPLETED) return;

      const due = new Date(task.dueDate);
      due.setHours(0,0,0,0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Alarm if overdue (diff < 0) or close to expiring (0 <= diff <= 2 days)
      if (diffDays <= 2) {
        let msg = '';
        if (diffDays < 0) {
          msg = `Công việc "${task.title}" đã quá hạn hoàn thành ${Math.abs(diffDays)} ngày (Kế hoạch: ${task.dueDate}).`;
        } else if (diffDays === 0) {
          msg = `Công việc "${task.title}" hết hạn hôm nay (Vui lòng khẩn trương hoàn tất).`;
        } else if (diffDays === 1) {
          msg = `Hạn hoàn thành công việc "${task.title}" là ngày mai (Còn 1 ngày).`;
        } else {
          msg = `Hạn hoàn thành công việc "${task.title}" là trong 2 ngày tới (${task.dueDate}).`;
        }

        const notificationId = `push-${task.id}-${task.dueDate}`;
        const isAlreadyRead = readNotificationIds.includes(notificationId);

        generatedAlerts.push({
          id: notificationId,
          taskId: task.id,
          taskTitle: task.title,
          message: msg,
          daysRemaining: diffDays,
          isRead: isAlreadyRead,
          timestamp: new Date('2026-06-11T05:18:39Z').toISOString() // current meta baseline static base
        });
      }
    });

    setNotifications(generatedAlerts);
  }, [tasks, readNotificationIds]);

  // Handle task saving (Creating or Editing)
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isNew = !taskData.id;
    let finalTaskList: Task[] = [];

    if (isNew) {
      // 1. Generate unique AppSheet-like key: UniqueID TSK-XXXXX
      const randomId = 'TSK-' + Math.floor(10000 + Math.random() * 90000);
      const newTask: Task = {
        ...taskData,
        id: randomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Task;

      finalTaskList = [...tasks, newTask];
      setTasks(finalTaskList);

      // 2. Trigger Bot Automation on new task record trigger insert!
      if (botEnabled) {
        const assignedUser = USER_PERSONAS.find(p => p.email === taskData.assignee);
        const assigneeName = assignedUser ? assignedUser.fullName : taskData.assignee;
        const assignorUser = USER_PERSONAS.find(p => p.email === taskData.assignor);
        const assignorName = assignorUser ? assignorUser.fullName : taskData.assignor;

        const newLog: BotLog = {
          id: 'BOT-LOG-' + Math.floor(1000 + Math.random() * 9000),
          triggerEvent: 'Thêm công việc mới',
          taskTitle: taskData.title,
          sender: 'bot-automation@aistudio-tasks.vn',
          receiverEmail: taskData.assignee,
          subject: `[Bot Thông Báo] Công việc mới được giao: ${taskData.title}`,
          body: `Chào ${assigneeName},\n\nBạn vừa được ${assignorName} giao một công việc mới trên hệ thống "Công việc" tối ưu di động.\n\n- Tên công việc: ${taskData.title}\n- Nội dung chi tiết: ${taskData.detail || '(Chưa có thông tin mô tả chi tiết)'}\n- Độ ưu tiên: ${taskData.priority}\n- Hạn hoàn thành: ${taskData.dueDate}\n\nVui lòng truy cập hệ thống để triển khai thực hiện và cập nhật trạng thái tiến trình sớm nhất có thể.\n\nTrân trọng cảm ơn.`,
          timestamp: new Date().toISOString()
        };

        setBotLogs(prev => [...prev, newLog]);
      }
    } else {
      // Updating existing task
      finalTaskList = tasks.map(t => {
        if (t.id === taskData.id) {
          return {
            ...t,
            ...taskData,
            updatedAt: new Date().toISOString()
          } as Task;
        }
        return t;
      });
      setTasks(finalTaskList);
    }

    setIsFormOpen(false);
    setTargetTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsFormOpen(false);
    setTargetTask(undefined);
  };

  const handleQuickUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds(prev => [...prev, id]);
  };

  const handleClearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const handleViewTaskFromNotification = (taskId: string) => {
    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) {
      setTargetTask(foundTask);
      setIsFormOpen(true);
    }
  };

  // Helper mock overdue trigger to make testing alerts visual and interactive
  const handleCreateMockOverdueTask = () => {
    const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1050 * 2).toISOString().split('T')[0]; // 2 days ago
    const mockTask: Task = {
      id: 'TSK-MOCK-' + Math.floor(100 + Math.random() * 900),
      title: 'Xử lý báo cáo khẩn về bảo mật rò rỉ dữ liệu',
      detail: 'Công việc quá hạn khẩn cấp được tạo tự động nhằm hỗ trợ chứng minh cơ chế thông báo cận hạn (Push alerts) của ứng dụng.',
      assignee: currentPersona.email,
      assignor: 'admin-audit@aistudio-tasks.vn',
      status: TaskStatus.NOT_STARTED,
      priority: TaskPriority.HIGH,
      dueDate: overdueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, mockTask]);
  };

  const unreadAlertsCount = notifications.filter(n => !n.isRead).length;

  // Active role capabilities checker
  const isAdmin = currentPersona.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-4 px-2 sm:py-8 sm:px-4 font-sans selection:bg-sky-500 selection:text-slate-950">
      
      {/* Visual Workspace Helper Dashboard Options - Sticky Desktop header info panel */}
      <div 
        id="desktop-helper-banner"
        className="w-full max-w-lg mb-4 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col space-y-2 text-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
            <Sliders className="w-4 h-4" />
            <span>XÚC TIẾN TRẢI NGHIỆM PROTOTYPE (MOCK APPSHEET CLONE)</span>
          </div>
          
          <button
            type="button"
            id="toggle-simulator-view-btn"
            onClick={() => setIsSimulatorMode(!isSimulatorMode)}
            className="p-1 px-2.5 bg-slate-950 border border-slate-800 rounded font-semibold text-sky-400 hover:bg-slate-850 active:scale-95 transition cursor-pointer"
          >
            {isSimulatorMode ? 'Tắt Khung Di Động' : 'Bật Khung Di Động Simulator'}
          </button>
        </div>
        
        <p className="text-slate-400 leading-normal font-medium">
          Ứng dụng thiết kế theo đặc điểm kỹ thuật của AppSheet: View nhóm trạng thái, lát cắt <strong>Việc của tôi</strong>, Bot <strong>Automation gửi email</strong> khi có việc mới, <strong>Bảo mật phân quyền</strong> khóa các cột thông tin dựa trên email vai trò (Admin vs Nhân viên).
        </p>
      </div>

      {/* Main Container viewport wrapper */}
      <div 
        id="main-app-shell"
        className={`w-full transition-all duration-300 ${
          isSimulatorMode 
            ? 'max-w-[410px] min-h-[820px] border-[10px] border-slate-800 rounded-[44px] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative bg-slate-950 overflow-hidden outline outline-2 outline-slate-800/50' 
            : 'max-w-xl min-h-[80vh] border border-slate-900 rounded-3xl bg-slate-950 overflow-hidden'
        } flex flex-col`}
      >
        
        {/* Simulator Notch visual decoration (Only visible if simulator frame logic is active) */}
        {isSimulatorMode && (
          <div className="w-full flex justify-center sticky top-0 bg-slate-950 z-30 pt-1.5">
            <div className="w-32 h-4.5 bg-slate-800 rounded-b-xl flex items-center justify-around px-3">
              <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
              <div className="w-12 h-1 bg-slate-950 rounded" />
              <div className="w-3 h-1 bg-slate-950 rounded" />
            </div>
          </div>
        )}

        {/* Application Core HEADER */}
        <header className="p-4 bg-slate-950/95 sticky top-0 z-20 border-b border-slate-900/40 backdrop-blur-md space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg shrink-0 shadow shadow-sky-500/20">
                <CheckSquare className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight leading-none text-slate-100 flex items-center">
                  Bảng 'Công việc' <Sparkles className="w-3 h-3 ml-1 text-sky-400 fill-current" />
                </h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-tight font-semibold">APPMINIST WORDSPACE v1.3</p>
              </div>
            </div>

            {/* Notification Bell Badge Button */}
            <button
              type="button"
              id="switch-notifications-tab-btn"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 bg-slate-900 hover:bg-slate-850 rounded-xl cursor-pointer text-slate-400 hover:text-slate-200 transition border border-slate-800"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span id="unread-alert-badge" className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-slate-950 font-mono font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Persona role switcher account selector */}
          <RoleSwitcher 
            currentPersona={currentPersona}
            onPersonaChange={(p) => {
              setCurrentPersona(p);
              // Fallback to home/dashboard on persona switch to let views recalculate properly
              setActiveTab('dashboard');
            }}
          />
        </header>

        {/* Dynamic Navigation content stage viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-5">
          {activeTab === 'dashboard' && (
            <StatsDashboard 
              tasks={tasks}
              onCreateMockOverdue={handleCreateMockOverdueTask}
            />
          )}

          {activeTab === 'grouped' && (
            <GroupedView 
              tasks={tasks}
              onEditTask={(t) => {
                setTargetTask(t);
                setIsFormOpen(true);
              }}
              currentPersona={currentPersona}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              tasks={tasks}
              onEditTask={(t) => {
                setTargetTask(t);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'my_tasks' && (
            <MyTasksView 
              tasks={tasks}
              onEditTask={(t) => {
                setTargetTask(t);
                setIsFormOpen(true);
              }}
              onQuickUpdateStatus={handleQuickUpdateStatus}
              currentPersona={currentPersona}
            />
          )}

          {activeTab === 'automation' && (
            <AutomationLogs 
              logs={botLogs}
              botEnabled={botEnabled}
              onToggleBot={() => setBotEnabled(!botEnabled)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel 
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationRead}
              onClearAll={handleClearAllNotifications}
              onViewTask={handleViewTaskFromNotification}
            />
          )}
        </main>

        {/* Global sticky Floater add action Button: only visible for ADMINS */}
        {isAdmin && activeTab !== 'automation' && activeTab !== 'notifications' && (
          <div className="absolute bottom-18 right-4 z-40">
            <button
              type="button"
              id="global-add-task-btn"
              onClick={() => {
                setTargetTask(undefined);
                setIsFormOpen(true);
              }}
              className="p-3 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full text-slate-950 font-extrabold shadow-xl hover:scale-105 active:scale-95 hover:brightness-115 transition flex items-center space-x-1.5 cursor-pointer"
              title="Thêm Công việc mới (Chỉ dành cho Admin)"
            >
              <PlusCircle className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold font-sans pr-1">Thêm Việc</span>
            </button>
          </div>
        )}

        {/* Mobile-aligned sticky Bottom Navigation Tab bar */}
        <nav 
          id="mobile-bottom-tabs"
          className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-900/60 backdrop-blur-md py-2.5 px-3 flex justify-between items-center z-30"
        >
          {/* Index 1 */}
          <button
            type="button"
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center flex-1 cursor-pointer transition ${
              activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 font-bold">Tổng quan</span>
          </button>

          {/* Index 2 */}
          <button
            type="button"
            id="tab-btn-grouped"
            onClick={() => setActiveTab('grouped')}
            className={`flex flex-col items-center flex-1 cursor-pointer transition ${
              activeTab === 'grouped' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 font-bold">Xem theo Nhóm</span>
          </button>

          {/* Index 3 */}
          <button
            type="button"
            id="tab-btn-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center flex-1 cursor-pointer transition ${
              activeTab === 'calendar' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <CalendarIcon className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 font-bold font-sans">Lịch biểu</span>
          </button>

          {/* Index 4 */}
          <button
            type="button"
            id="tab-btn-my_tasks"
            onClick={() => setActiveTab('my_tasks')}
            className={`flex flex-col items-center flex-1 cursor-pointer transition ${
              activeTab === 'my_tasks' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 font-bold truncate max-w-[50px]">Việc của tôi</span>
          </button>

          {/* Index 5 */}
          <button
            type="button"
            id="tab-btn-automation"
            onClick={() => setActiveTab('automation')}
            className={`flex flex-col items-center flex-1 cursor-pointer transition ${
              activeTab === 'automation' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Bot className="w-4.5 h-4.5 text-indigo-400" />
            <span className="text-[9px] mt-1 font-bold">Automation</span>
          </button>
        </nav>

      </div>

      {/* Shared Task Form (Create or Edit wrapper) */}
      {isFormOpen && (
        <TaskForm
          task={targetTask}
          onClose={() => {
            setIsFormOpen(false);
            setTargetTask(undefined);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          currentPersona={currentPersona}
        />
      )}

      {/* Tiny footer credentials watermark for visual balance */}
      <footer className="mt-4 text-center space-y-1">
        <p className="text-[10px] text-slate-600 font-mono font-medium flex items-center justify-center">
          <Info className="w-3.5 h-3.5 mr-1" /> Phát triển cho Trần Xuân Tuy • Mã nguồn React + Tailwind v4
        </p>
      </footer>

    </div>
  );
}
