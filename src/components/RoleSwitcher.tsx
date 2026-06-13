import { useState } from 'react';
import { UserPersona, UserRole } from '../types';
import { USER_PERSONAS } from '../data/initialData';
import { Shield, ShieldAlert, ChevronDown, Check, UserCheck } from 'lucide-react';

interface RoleSwitcherProps {
  currentPersona: UserPersona;
  onPersonaChange: (persona: UserPersona) => void;
}

export default function RoleSwitcher({ currentPersona, onPersonaChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <div 
        id="role-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-lg cursor-pointer hover:bg-slate-800 transition duration-150"
      >
        <div className="flex items-center space-x-3 text-left">
          <div className="relative">
            <img 
              src={currentPersona.avatarUrl} 
              alt={currentPersona.fullName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${currentPersona.role === 'Admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
              {currentPersona.role === 'Admin' ? (
                <Shield className="w-3 h-3 text-slate-950" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-slate-950" />
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono">USEREMAIL()</p>
            <p className="text-sm font-semibold tracking-tight leading-none text-slate-100">{currentPersona.fullName}</p>
            <p className="text-[11px] text-slate-400 mt-1">{currentPersona.email}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div 
            id="role-switch-backdrop"
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            id="role-switcher-menu"
            className="absolute right-0 left-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 focus:outline-none transition-all animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Chọn tài khoản đăng nhập (USEREMAIL())
            </p>
            <div className="space-y-1 mt-1">
              {USER_PERSONAS.map((persona) => {
                const isSelected = persona.email === currentPersona.email;
                return (
                  <button
                    key={persona.email}
                    id={`persona-select-${persona.email.split('@')[0]}`}
                    onClick={() => {
                      onPersonaChange(persona);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition duration-150 ${
                      isSelected 
                        ? 'bg-slate-800/80 border border-slate-700/80 text-white' 
                        : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={persona.avatarUrl} 
                        alt={persona.fullName} 
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-medium">{persona.fullName}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                            persona.role === 'Admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {persona.role === 'Admin' ? 'Admin' : 'Nhân viên'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight">{persona.email}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-2 p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-normal">
              <p className="font-semibold text-slate-300 flex items-center mb-0.5">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-sky-400" />
                Quy tắc Phân Quyền (Security):
              </p>
              <ul className="list-disc pl-3.5 space-y-0.5">
                <li><strong className="text-amber-400 text-[10px]">Admin (Trưởng nhóm):</strong> Có toàn quyền Thêm, Sửa tất cả các trường, và Xóa mọi công việc.</li>
                <li><strong className="text-emerald-400 text-[10px]">Nhân viên:</strong> Được phép <strong className="text-slate-300">Thêm mới công việc</strong> và <strong className="text-slate-300">Xóa công việc</strong>. Đối với việc chỉnh sửa: được toàn quyền sửa những việc do bản thân tạo ra; đối với việc do người khác giao, chỉ cho phép cập nhật Trạng thái.</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
