import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Wand2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone, 
  Mail,
  AlertCircle
} from 'lucide-react';
import { GmailAccount } from '../types';
import { generateSecurePassword, evaluatePasswordStrength } from '../utils/crypto';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<GmailAccount, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  editingAccount?: GmailAccount | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [statusNote, setStatusNote] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [twoFactorKey, setTwoFactorKey] = useState('');
  const [note, setNote] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAccount) {
      setEmail(editingAccount.email || '');
      setPassword(editingAccount.password || '');
      setIsActive(editingAccount.isActive ?? true);
      setStatusNote(editingAccount.statusNote || '');
      setRecoveryEmail(editingAccount.recoveryEmail || '');
      setRecoveryPhone(editingAccount.recoveryPhone || '');
      setTwoFactorKey(editingAccount.twoFactorKey || '');
      setNote(editingAccount.note || '');
    } else {
      setEmail('');
      setPassword(generateSecurePassword({
        length: 16,
        useUpper: true,
        useLower: true,
        useNumbers: true,
        useSymbols: true,
      }));
      setIsActive(true);
      setStatusNote('');
      setRecoveryEmail('');
      setRecoveryPhone('');
      setTwoFactorKey('');
      setNote('');
    }
    setError('');
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword({
      length: 16,
      useUpper: true,
      useLower: true,
      useNumbers: true,
      useSymbols: true,
    });
    setPassword(newPass);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalEmail = email.trim();
    if (!finalEmail) {
      setError('Vui lòng nhập địa chỉ Gmail');
      return;
    }
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@gmail.com`;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    onSave(
      {
        email: finalEmail,
        password: password.trim(),
        isActive,
        statusNote: statusNote.trim() || undefined,
        linkedApps: editingAccount?.linkedApps || [],
        recoveryEmail: recoveryEmail.trim() || undefined,
        recoveryPhone: recoveryPhone.trim() || undefined,
        twoFactorKey: twoFactorKey.trim() || undefined,
        note: note.trim() || undefined,
        lastCheckedAt: new Date().toISOString(),
      },
      editingAccount ? editingAccount.id : undefined
    );
    onClose();
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{editingAccount ? 'Chỉnh sửa tài khoản Gmail' : 'Thêm tài khoản Gmail mới'}</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Lưu trữ an toàn trên thiết bị của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1 flex items-center justify-between">
              <span>Địa chỉ Gmail *</span>
              <span className="text-[11px] text-slate-400 font-normal">
                (Tự thêm @gmail.com nếu chỉ nhập tên)
              </span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="VD: sn261107@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-600 rounded-lg pl-9 pr-3 py-2 font-mono outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-200">Mật khẩu *</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                title="Tạo mật khẩu mạnh ngẫu nhiên"
              >
                <Wand2 className="w-3 h-3" />
                <span>Tạo mật khẩu mạnh</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white rounded-lg pl-3 pr-10 py-2 font-mono tracking-wider outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showPassword ? 'Ẩn' : 'Hiện'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 flex-1 max-w-[160px] mr-2">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded-full ${
                        bar <= strength.score
                          ? strength.score === 1
                            ? 'bg-rose-500'
                            : strength.score === 2
                            ? 'bg-amber-500'
                            : strength.score === 3
                            ? 'bg-emerald-500'
                            : 'bg-cyan-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <span className={`font-medium ${strength.colorClass}`}>
                  Độ mạnh: {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Dấu tích Còn Sài Được Hay Không */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="isActiveCheckbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <label htmlFor="isActiveCheckbox" className="font-bold text-white cursor-pointer flex items-center gap-1.5">
                <span>Dấu tích: Tài khoản còn dùng được</span>
                {isActive ? (
                  <span className="text-[11px] text-emerald-400 font-medium">(Live)</span>
                ) : (
                  <span className="text-[11px] text-rose-400 font-medium">(Đã hỏng / Die)</span>
                )}
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tích vào đây nếu tài khoản đang hoạt động tốt. Bỏ tích nếu tài khoản bị khóa hoặc hỏng.
              </p>
            </div>
          </div>

          {/* Status Note & Extra Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ghi chú trạng thái
              </label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="VD: Live, Cần đổi pass..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ghi chú tài khoản
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Acc mua ngày..., TV phòng khách..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
          </div>

          {/* Recovery details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Email khôi phục (nếu có)</span>
              </label>
              <input
                type="text"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="backup@outlook.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span>Số điện thoại / 2FA (nếu có)</span>
              </label>
              <input
                type="text"
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 transition-all active:scale-[0.98]"
            >
              {editingAccount ? 'Lưu thay đổi' : 'Thêm tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
