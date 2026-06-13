export enum TaskStatus {
  NOT_STARTED = 'Chưa bắt đầu',
  IN_PROGRESS = 'Đang thực hiện',
  AWAITING_APPROVAL = 'Chờ duyệt',
  COMPLETED = 'Hoàn thành',
  PAUSED = 'Tạm dừng'
}

export enum TaskPriority {
  LOW = 'Thấp',
  MEDIUM = 'Trung bình',
  HIGH = 'Cao'
}

export interface Task {
  id: string; // Mã công việc / ID Công việc (Key, Text, auto unique ID)
  title: string; // Tên công việc (Text, bắt buộc)
  detail: string; // Nội dung chi tiết (LongText)
  assignee: string; // Người được giao (Email, phân công)
  assignor: string; // Người giao việc (Email, default USEREMAIL())
  status: TaskStatus; // Trạng thái
  priority: TaskPriority; // Độ ưu tiên
  dueDate: string; // Hạn hoàn thành / Ngày hết hạn (Date format YYYY-MM-DD)
  attachmentName?: string; // Tên files/tài liệu đính kèm
  attachmentData?: string; // Giả lập dữ liệu/URL file đính kèm
  createdAt: string;
  updatedAt: string;
}

export interface BotLog {
  id: string;
  triggerEvent: string; // "Thêm công việc mới" | "Cập nhật công việc"
  taskTitle: string;
  sender: string;
  receiverEmail: string; // [Người được giao]
  subject: string;
  body: string; // Gửi nội dung chi tiết và tên công việc
  timestamp: string;
}

export interface PushNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  daysRemaining: number;
  isRead: boolean;
  timestamp: string;
}

export type UserRole = 'Admin' | 'NhanVien';

export interface UserPersona {
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
}
