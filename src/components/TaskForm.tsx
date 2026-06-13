import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, UserPersona, UserRole } from '../types';
import { USER_PERSONAS } from '../data/initialData';
import { X, Calendar, User, FileText, Link, Shield, AlertTriangle, Trash2, Mail, CheckCircle2 } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (taskId: string) => void;
  currentPersona: UserPersona;
}

export default function TaskForm({ task, onClose, onSave, onDelete, currentPersona }: TaskFormProps) {
  const isEdit = !!task;
  const isAdmin = currentPersona.role === 'Admin';
  
  // Rule: Employees can edit tasks assigned to them or created/assigned by them.
  const isAssignedToMe = task ? task.assignee === currentPersona.email : false;
  const isCreatedByMe = task ? task.assignor === currentPersona.email : false;
  
  // Can current persona edit this task?
  // - Admin can edit anything
  // - Employee can edit if they created it, or if it is assigned to them
  const canEdit = isAdmin || (isEdit && (isAssignedToMe || isCreatedByMe));

  // States
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [assignee, setAssignee] = useState('nhanvien@gmail.com');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.NOT_STARTED);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentData, setAttachmentData] = useState('');
  
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDetail(task.detail);
      setAssignee(task.assignee);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setAttachmentName(task.attachmentName || '');
      setAttachmentData(task.attachmentData || '');
    } else {
      // Default creation state
      setTitle('');
      setDetail('');
      setAssignee('nhanvien@gmail.com');
      setStatus(TaskStatus.NOT_STARTED);
      setPriority(TaskPriority.MEDIUM);
      // Set default due date to 3 days from now
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDueDate(threeDaysLater);
      setAttachmentName('');
      setAttachmentData('');
    }
    setError('');
  }, [task]);

  // Handle files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setAttachmentData(event.target.result);
      }
    };
    // Support visual preview if it is an image
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      // Otherwise just use standard indicator representation
      setAttachmentData('file_attached');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Tên công việc là bắt buộc nhập!');
      return;
    }

    if (!dueDate) {
      setError('Hạn hoàn thành là bắt buộc!');
      return;
    }

    // Role safety checks in client:
    if (isEdit) {
      if (!canEdit) {
        setError('Bạn không có quyền chỉnh sửa công việc này!');
        return;
      }
      // If employee, let them edit everything they created. But if they didn't create it and only got assigned, restrict to status only.
      if (!isAdmin && isAssignedToMe && !isCreatedByMe) {
        // Person is an employee and is editing. They are ONLY allowed to edit STATUS.
        // We override any potential hacks by copying only status and keeping everything else relative to original task!
        onSave({
          id: task.id,
          title: task.title, // locked
          detail: task.detail, // locked
          assignee: task.assignee, // locked
          assignor: task.assignor, // locked
          status: status, // allowed!
          priority: task.priority, // locked
          dueDate: task.dueDate, // locked
          attachmentName: task.attachmentName, // locked
          attachmentData: task.attachmentData // locked
        });
        return;
      }
    }

    // Saved by User
    onSave({
      id: task?.id,
      title,
      detail,
      assignee,
      assignor: task?.assignor || currentPersona.email, // Defaults to current user (creator/USEREMAIL())
      status,
      priority,
      dueDate,
      attachmentName,
      attachmentData
    });
  };

  const handleDeleteClick = () => {
    if (isEdit && task && onDelete) {
      onDelete(task.id);
    }
  };

  // Determine if fields are locked (employee restriction)
  // If editing, normal user, and didn't create it, fields are locked.
  const isFieldsLocked = isEdit && !isAdmin && !isCreatedByMe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="task-form-container"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {isEdit ? 'Chi tiết / Cập nhật Công việc' : 'Tạo Công việc mới'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? `Mã công việc: ${task.id}` : 'Nhập thông tin bảng Công việc'}
            </p>
          </div>
          <button 
            id="close-task-form-btn"
            onClick={onClose} 
            className="p-1 px-2.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Security Banner if fields are locked */}
          {isFieldsLocked && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl flex items-start space-x-2 text-xs">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Bạn đang là Nhân viên:</span> Hệ thống khóa các trường dữ liệu chính của công việc này (vì do tài khoản khác tạo/giao) và chỉ cho phép bạn điều chỉnh <strong className="underline text-teal-300">Trạng thái công việc</strong>.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tên công việc (Text, Bắt buộc) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
              Tên công việc <span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="input-task-title"
              disabled={isFieldsLocked}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế trang chủ ứng dụng..."
              className={`w-full bg-slate-950 border text-sm rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                isFieldsLocked 
                  ? 'border-slate-850 bg-slate-950/50 text-slate-400 cursor-not-allowed' 
                  : 'border-slate-800'
              }`}
            />
          </div>

          {/* Trạng thái (Enum) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Trạng thái (Status) <span className="text-rose-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TaskStatus).map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={isEdit && !canEdit} // If employee and not assigned: locked completely
                    onClick={() => setStatus(st)}
                    className={`flex items-center justify-center p-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Độ ưu tiên (Enum) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Độ ưu tiên (Priority)
            </label>
            <div className="flex space-x-2">
              {Object.values(TaskPriority).map((pr) => {
                const isSelected = priority === pr;
                let colorClass = 'border-slate-850 text-slate-400';
                if (isSelected) {
                  if (pr === TaskPriority.HIGH) colorClass = 'bg-rose-500/20 border-rose-500 text-rose-400';
                  else if (pr === TaskPriority.MEDIUM) colorClass = 'bg-amber-500/20 border-amber-500 text-amber-400';
                  else colorClass = 'bg-slate-500/20 border-slate-500 text-slate-400';
                }

                return (
                  <button
                    key={pr}
                    type="button"
                    disabled={isFieldsLocked}
                    onClick={() => setPriority(pr)}
                    className={`flex-1 p-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      isFieldsLocked && !isSelected ? 'opacity-40 cursor-not-allowed' : ''
                    } ${colorClass} bg-slate-950`}
                  >
                    {pr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ngày hết hạn / Hạn hoàn thành (Date) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 font-medium" /> Hạn hoàn thành
            </label>
            <input
              type="date"
              id="input-task-due-date"
              disabled={isFieldsLocked}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full bg-slate-950 border text-sm rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                isFieldsLocked ? 'border-slate-850 bg-slate-950/50 text-slate-500 cursor-not-allowed' : 'border-slate-800'
              }`}
            />
          </div>

          {/* Người được giao (Email, dùng phân công) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-slate-440 font-medium" /> Người được giao (Email)
            </label>
            {isFieldsLocked ? (
              <div id="display-task-assignee" className="w-full bg-slate-950/50 border border-slate-850 text-sm rounded-xl px-3 py-2.5 text-slate-400 flex items-center font-mono">
                <Mail className="w-3.5 h-3.5 mr-2 text-slate-500" />
                {assignee}
              </div>
            ) : (
              <select
                id="select-task-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {USER_PERSONAS.map((p) => (
                  <option key={p.email} value={p.email}>
                    {p.fullName} ({p.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Người giao việc (Email, default USEREMAIL()) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Người giao việc (Tự động)
            </label>
            <div className="w-full bg-slate-950/50 border border-slate-850 text-xs rounded-xl px-3 py-2.5 text-slate-500 flex items-center font-mono">
              <Shield className="w-3.5 h-3.5 mr-2 text-slate-600" />
              {isEdit ? task.assignor : currentPersona.email} <span className="ml-1 text-[10px] text-slate-600">(USEREMAIL())</span>
            </div>
          </div>

          {/* Nội dung chi tiết (LongText) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" /> Nội dung chi tiết (Mô tả công việc)
            </label>
            <textarea
              id="input-task-detail"
              disabled={isFieldsLocked}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Nhập ghi chú, chỉ dẫn chi tiết của công việc..."
              rows={4}
              className={`w-full bg-slate-950 border text-sm rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                isFieldsLocked ? 'border-slate-850 bg-slate-950/50 text-slate-400 cursor-not-allowed' : 'border-slate-800'
              }`}
            />
          </div>

          {/* Tài liệu đính kèm (File) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center">
              <Link className="w-3.5 h-3.5 mr-1 text-slate-400" /> Tài liệu đính kèm/Hình ảnh
            </label>
            
            {isFieldsLocked ? (
              attachmentName ? (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-300 font-medium">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{attachmentName}</span>
                  </div>
                  {attachmentData && attachmentData.startsWith('data:image/') && (
                    <img 
                      src={attachmentData} 
                      alt="thumbnail" 
                      className="w-8 h-8 rounded object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic px-1">Không có tài liệu đính kèm</p>
              )
            ) : (
              <div 
                id="file-drop-area"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-sky-500 bg-sky-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  type="file"
                  id="input-task-attachment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {attachmentName ? (
                  <div className="flex items-center justify-between text-xs text-left">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-5 h-5 text-sky-500 shrink-0" />
                      <div>
                        <p className="text-slate-200 font-semibold truncate max-w-[200px]">{attachmentName}</p>
                        <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Tải lên thành công ✅</p>
                      </div>
                    </div>
                    {attachmentData && attachmentData.startsWith('data:image/') ? (
                      <img 
                        src={attachmentData} 
                        alt="preview" 
                        className="w-10 h-10 rounded object-cover border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachmentName('');
                          setAttachmentData('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-rose-500 hover:text-rose-400 p-1"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Nhấp để chọn hoặc kéo thả tệp đính kèm</p>
                    <p className="text-[10px] text-slate-500 mt-1">Ảnh minh chứng, PDF, Báo cáo (.docx, .pdf, .jpg)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex space-x-3">
            {isEdit && onDelete && (
              <button
                type="button"
                id="delete-task-btn"
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:bg-rose-950/80 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa việc</span>
              </button>
            )}

            <button
              type="submit"
              id="save-task-btn"
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/10 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            >
              {isEdit ? 'Cập nhật Công việc' : 'Thêm Công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
