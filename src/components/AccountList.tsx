import React, { useState } from 'react';
import { 
  Check, 
  X as XIcon, 
  Copy, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Shield,
  Smartphone,
  Key,
  Lock
} from 'lucide-react';
import { GmailAccount } from '../types';

interface AccountListProps {
  accounts: GmailAccount[];
  searchQuery: string;
  viewMode: 'table' | 'grid';
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onUpdatePassword?: (id: string, newPassword: string) => void;
  onEditAccount: (account: GmailAccount) => void;
  onDeleteAccount: (id: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  searchQuery,
  viewMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleActive,
  onUpdatePassword,
  onEditAccount,
  onDeleteAccount,
  onShowToast,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [inlinePasswordValue, setInlinePasswordValue] = useState<string>('');

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, label: string, fieldId: string) => {
    if (!text) {
      onShowToast(`Chưa có ${label} để sao chép`, 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      onShowToast(`Đã sao chép ${label}!`, 'success');
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch {
      onShowToast(`Không thể sao chép`, 'info');
    }
  };

  const handleStartEditPassword = (id: string, currentPass: string) => {
    setEditingPasswordId(id);
    setInlinePasswordValue(currentPass || '');
  };

  const handleSaveInlinePassword = (id: string) => {
    if (onUpdatePassword) {
      onUpdatePassword(id, inlinePasswordValue.trim());
      onShowToast('Đã lưu mật khẩu!', 'success');
    }
    setEditingPasswordId(null);
  };

  // Highlight matching search characters
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-cyan-500/35 text-cyan-200 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const allSelected = accounts.length > 0 && selectedIds.length === accounts.length;

  if (accounts.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-10 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500 mb-2.5">
          <Key className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Không tìm thấy tài khoản phù hợp
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {searchQuery
            ? `Không có Gmail nào khớp với từ khóa "${searchQuery}".`
            : 'Chưa có tài khoản nào. Hãy nhấn "Tải tệp / Ảnh chụp" hoặc "Thêm mới" để bắt đầu.'}
        </p>
      </div>
    );
  }

  // TABLE VIEW (Siêu gọn với ô trạng thái chỉ dấu v và x)
  if (viewMode === 'table') {
    return (
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/70 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] select-none">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                    title="Chọn tất cả"
                  />
                </th>
                <th className="py-2.5 px-2 w-14 text-center">
                  <span title="Trạng thái: ✓ (Còn dùng được) / ✕ (Đã hỏng)">✓ / ✕</span>
                </th>
                <th className="py-2.5 px-3.5 min-w-[260px]">
                  <span>Địa chỉ Gmail</span>
                </th>
                <th className="py-2.5 px-3.5 min-w-[250px]">
                  <span>Mật khẩu</span>
                </th>
                <th className="py-2.5 px-3.5 min-w-[150px]">
                  <span>Ghi chú</span>
                </th>
                <th className="py-2.5 px-3.5 w-24 text-right">
                  <span>Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {accounts.map((acc) => {
                const isSelected = selectedIds.includes(acc.id);
                const isPassVisible = visiblePasswords[acc.id] || false;
                const isCopiedEmail = copiedField === `email-${acc.id}`;
                const isCopiedPass = copiedField === `pass-${acc.id}`;
                const isExpanded = expandedId === acc.id;
                const isEditingPassword = editingPasswordId === acc.id;

                return (
                  <React.Fragment key={acc.id}>
                    <tr
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      } ${!acc.isActive ? 'opacity-85' : ''}`}
                    >
                      {/* Selection checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(acc.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                        />
                      </td>

                      {/* Compact Status Button: CHỈ DẤU V VÀ X ĐỠ CHIẾM CHỖ */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => onToggleActive(acc.id, acc.isActive)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            acc.isActive
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-sm shadow-rose-500/20 ring-1 ring-rose-400/40'
                          }`}
                          title={
                            acc.isActive
                              ? 'Còn dùng được (Bấm để đổi thành ✕ Hỏng)'
                              : 'Đã hỏng (Bấm để đổi thành ✓ Còn dùng)'
                          }
                        >
                          {acc.isActive ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <XIcon className="w-4 h-4 stroke-[3]" />
                          )}
                        </button>
                      </td>

                      {/* Gmail address with instant copy */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2 group">
                          <span className="font-mono text-sm font-medium text-slate-100 select-all">
                            {highlightMatch(acc.email, searchQuery)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(acc.email, 'Gmail', `email-${acc.id}`)}
                            className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100"
                            title="Sao chép email"
                          >
                            {isCopiedEmail ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {acc.statusNote && (
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                            {acc.statusNote}
                          </div>
                        )}
                      </td>

                      {/* Password with inline editing */}
                      <td className="py-2.5 px-3.5 font-mono">
                        {isEditingPassword ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <input
                              type="text"
                              autoFocus
                              value={inlinePasswordValue}
                              onChange={(e) => setInlinePasswordValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlinePassword(acc.id);
                                if (e.key === 'Escape') setEditingPasswordId(null);
                              }}
                              placeholder="Nhập mật khẩu..."
                              className="bg-slate-950 border border-cyan-400 text-xs text-white px-2 py-1 rounded outline-none w-36 font-mono"
                            />
                            <button
                              onClick={() => handleSaveInlinePassword(acc.id)}
                              className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                              title="Lưu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPasswordId(null)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Hủy"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : acc.password ? (
                          <div className="flex items-center gap-1.5 group">
                            <span
                              onClick={() => handleStartEditPassword(acc.id, acc.password)}
                              className="text-sm font-medium text-slate-200 select-all tracking-wider cursor-pointer hover:text-cyan-300 transition-colors"
                              title="Nhấp để sửa mật khẩu nhanh"
                            >
                              {isPassVisible ? acc.password : '••••••••••••'}
                            </span>

                            <button
                              onClick={() => togglePasswordVisibility(acc.id)}
                              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors ml-0.5"
                              title={isPassVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => copyToClipboard(acc.password, 'Mật khẩu', `pass-${acc.id}`)}
                              className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition-colors"
                              title="Sao chép mật khẩu"
                            >
                              {isCopiedPass ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleStartEditPassword(acc.id, acc.password)}
                              className="text-slate-500 hover:text-cyan-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Sửa mật khẩu"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditPassword(acc.id, '')}
                            className="text-xs text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded font-sans flex items-center gap-1.5 transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            <span>+ Nhập pass</span>
                          </button>
                        )}
                      </td>

                      {/* Note column */}
                      <td className="py-2.5 px-3.5 text-slate-400 text-xs">
                        {acc.note ? (
                          <span className="truncate max-w-[200px] block" title={acc.note}>
                            {acc.note}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : acc.id)}
                            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                              isExpanded ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Chi tiết bổ sung (Khôi phục, 2FA)"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditAccount(acc)}
                            className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/60 border-b border-slate-800">
                        <td colSpan={6} className="px-5 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                            {acc.recoveryEmail && (
                              <div className="flex items-start gap-2">
                                <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="text-[11px] text-slate-500">Email khôi phục:</div>
                                  <div className="font-mono text-slate-200">{acc.recoveryEmail}</div>
                                </div>
                              </div>
                            )}

                            {acc.recoveryPhone && (
                              <div className="flex items-start gap-2">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="text-[11px] text-slate-500">SĐT khôi phục:</div>
                                  <div className="font-mono text-slate-200">{acc.recoveryPhone}</div>
                                </div>
                              </div>
                            )}

                            {acc.twoFactorKey && (
                              <div className="flex items-start gap-2">
                                <Key className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                                <div>
                                  <div className="text-[11px] text-slate-500">2FA / Mã sao lưu:</div>
                                  <div className="font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                                    {acc.twoFactorKey}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // GRID / CARD VIEW (Ô trạng thái chỉ dấu v và x)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {accounts.map((acc) => {
        const isSelected = selectedIds.includes(acc.id);
        const isPassVisible = visiblePasswords[acc.id] || false;
        const isCopiedEmail = copiedField === `email-${acc.id}`;
        const isCopiedPass = copiedField === `pass-${acc.id}`;
        const isEditingPassword = editingPasswordId === acc.id;

        return (
          <div
            key={acc.id}
            className={`border rounded-xl p-3.5 transition-all bg-slate-900/80 backdrop-blur-sm relative group flex flex-col justify-between ${
              isSelected
                ? 'border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                : 'border-slate-800 hover:border-slate-700/80'
            }`}
          >
            <div>
              {/* Card Header with Checkbox and Compact Status Icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(acc.id)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                />

                {/* Status Toggle Button: CHỈ DẤU V VÀ X */}
                <button
                  onClick={() => onToggleActive(acc.id, acc.isActive)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    acc.isActive
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-sm shadow-rose-500/20'
                  }`}
                  title={
                    acc.isActive
                      ? 'Còn dùng được (Bấm để đổi thành ✕)'
                      : 'Đã hỏng (Bấm để đổi thành ✓)'
                  }
                >
                  {acc.isActive ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <XIcon className="w-4 h-4 stroke-[3]" />
                  )}
                </button>
              </div>

              {/* Email Address */}
              <div className="mb-2">
                <div className="flex items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                  <span className="font-mono text-sm font-semibold text-white truncate select-all">
                    {highlightMatch(acc.email, searchQuery)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(acc.email, 'Gmail', `email-${acc.id}`)}
                    className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 shrink-0 transition-colors"
                    title="Sao chép email"
                  >
                    {isCopiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="mb-2">
                {isEditingPassword ? (
                  <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-lg border border-cyan-400">
                    <input
                      type="text"
                      autoFocus
                      value={inlinePasswordValue}
                      onChange={(e) => setInlinePasswordValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlinePassword(acc.id);
                        if (e.key === 'Escape') setEditingPasswordId(null);
                      }}
                      placeholder="Nhập mật khẩu..."
                      className="bg-transparent text-xs text-white outline-none w-full font-mono px-1"
                    />
                    <button
                      onClick={() => handleSaveInlinePassword(acc.id)}
                      className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : acc.password ? (
                  <div className="flex items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                    <span
                      onClick={() => handleStartEditPassword(acc.id, acc.password)}
                      className="text-sm font-medium text-slate-200 truncate select-all tracking-wider cursor-pointer hover:text-cyan-300"
                      title="Nhấp để sửa mật khẩu"
                    >
                      {isPassVisible ? acc.password : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePasswordVisibility(acc.id)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                        title={isPassVisible ? 'Ẩn' : 'Hiện'}
                      >
                        {isPassVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(acc.password, 'Mật khẩu', `pass-${acc.id}`)}
                        className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Sao chép mật khẩu"
                      >
                        {isCopiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEditPassword(acc.id, '')}
                    className="w-full text-xs text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2 rounded-lg font-sans flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>+ Tự nhập mật khẩu cho Gmail này</span>
                  </button>
                )}
              </div>

              {/* Notes if any */}
              {acc.note && (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-1.5 rounded border border-slate-800/60 line-clamp-2">
                  {acc.note}
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">
                {new Date(acc.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditAccount(acc)}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDeleteAccount(acc.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
