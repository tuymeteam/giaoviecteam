import { Task, TaskStatus, TaskPriority, UserPersona, BotLog } from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    email: 'Tranxuantuy2112@gmail.com',
    fullName: 'Trần Xuân Tuy (Admin)',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },
  {
    email: 'nhanvien@gmail.com',
    fullName: 'Nguyễn Văn Nhân (Nhân viên)',
    role: 'NhanVien',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    email: 'phuongly@gmail.com',
    fullName: 'Phạm Phương Ly (Nhân viên)',
    role: 'NhanVien',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-84920',
    title: 'Thiết kế giao diện Mobile hoàn chỉnh',
    detail: 'Thiết kế các màn hình cho ứng dụng quản lý công việc di động bao gồm màn hình Lịch biểu, Kanban Grouped, và Chi tiết lát cắt "Việc của tôi". Đồng bộ màu sắc thương hiệu và nâng cao tính khả dụng cho việc thao tác chạm một tay.',
    assignee: 'nhanvien@gmail.com',
    assignor: 'Tranxuantuy2112@gmail.com',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0], // 2 ngày tới
    attachmentName: 'figma_ui_design_v2.pdf',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TSK-93810',
    title: 'Viết mã kiểm thử tích hợp API & Firestore',
    detail: 'Thiết lập khung kiểm thử và các API routes phụ trách đồng bộ hóa tự động dữ liệu công việc, đảm bảo hiệu suất truy vấn dưới 100ms cho các máy chủ di động băng thông thấp.',
    assignee: 'nhanvien@gmail.com',
    assignor: 'Tranxuantuy2112@gmail.com',
    status: TaskStatus.AWAITING_APPROVAL,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ngày mai
    attachmentName: 'test_coverage_report.txt',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TSK-40812',
    title: 'Chuẩn bị báo cáo tiến độ tuần 2 tháng 6',
    detail: 'Tổng hợp số liệu hoàn thành mục tiêu OKR, các trở ngại gặp phải liên quan đến phân quyền bảo mật cấp cao, và báo cáo trực tiếp trong buổi họp trực tuyến sáng thứ Hai.',
    assignee: 'phuongly@gmail.com',
    assignor: 'Tranxuantuy2112@gmail.com',
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.LOW,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5).toISOString().split('T')[0], // 5 ngày tới
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TSK-20155',
    title: 'Sửa lỗi giao diện Responsive trên màn hình iPad',
    detail: 'Khắc phục vấn đề các cột của Grouped View nhảy sai vị trí khi người dùng xoay ngang màn hình máy tính bảng. Tối ưu CSS Grid và Flexbox.',
    assignee: 'Tranxuantuy2112@gmail.com',
    assignor: 'Tranxuantuy2112@gmail.com',
    status: TaskStatus.PAUSED,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0], // 3 ngày tới
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TSK-11002',
    title: 'Hoàn thiện tài liệu kiến trúc kỹ thuật bảo mật',
    detail: 'Xây dựng tài liệu hướng dẫn lập cấu hình Security Table Permissions theo mô hình ABAC. Thêm sơ đồ luồng dữ liệu của lát cắt [Người được giao] = USEREMAIL().',
    assignee: 'Tranxuantuy2112@gmail.com',
    assignor: 'Tranxuantuy2112@gmail.com',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // hôm qua
    attachmentName: 'guideline_security_rules.pdf',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_BOT_LOGS: BotLog[] = [
  {
    id: 'BOT-LOG-4821',
    triggerEvent: 'Thêm công việc mới',
    taskTitle: 'Thiết kế giao diện Mobile hoàn chỉnh',
    sender: 'bot-automation@aistudio-tasks.vn',
    receiverEmail: 'nhanvien@gmail.com',
    subject: '[Bot Thông Báo] Công việc mới được giao: Thiết kế giao diện Mobile hoàn chỉnh',
    body: 'Chào Nguyễn Văn Nhân, bạn vừa được Trần Xuân Tuy giao một công việc mới.\n\n- Tên công việc: Thiết kế giao diện Mobile hoàn chỉnh\n- Nội dung chi tiết: Thiết kế các màn hình cho ứng dụng quản lý công việc di động bao gồm màn hình Lịch biểu, Kanban Grouped, và Chi tiết lát cắt "Việc của tôi". Đồng bộ màu sắc thương hiệu và nâng cao tính khả dụng cho việc thao tác chạm một tay.\n\nVui lòng truy cập hệ thống để cập nhật tiến độ công việc.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString()
  },
  {
    id: 'BOT-LOG-4822',
    triggerEvent: 'Thêm công việc mới',
    taskTitle: 'Viết mã kiểm thử tích hợp API & Firestore',
    sender: 'bot-automation@aistudio-tasks.vn',
    receiverEmail: 'nhanvien@gmail.com',
    subject: '[Bot Thông Báo] Công việc mới được giao: Viết mã kiểm thử tích hợp API & Firestore',
    body: 'Chào Nguyễn Văn Nhân, bạn vừa được Trần Xuân Tuy giao một công việc mới.\n\n- Tên công việc: Viết mã kiểm thử tích hợp API & Firestore\n- Nội dung chi tiết: Thiết lập khung kiểm thử và các API routes phụ trách đồng bộ hóa tự động dữ liệu công việc...\n\nVui lòng truy cập hệ thống để cập nhật tiến độ.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString()
  }
];
