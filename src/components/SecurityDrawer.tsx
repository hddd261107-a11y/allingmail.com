import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  HardDrive, 
  Check, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

interface SecurityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const SecurityDrawer: React.FC<SecurityDrawerProps> = ({
  isOpen,
  onClose,
  onClearAllData,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Bảo Mật & Lưu Trữ Riêng Tư
              </h2>
              <p className="text-xs text-slate-400">
                100% Offline & Không cần đăng nhập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-cyan-950 text-cyan-400 rounded-md mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-xs mb-0.5">
                  Không cần tài khoản hay xác thực đám mây
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Ứng dụng tuân thủ yêu cầu của bạn: không ép đăng nhập tài khoản bên ngoài. Mọi thông tin Gmail, mật khẩu, và ứng dụng liên kết được lưu trữ an toàn trong bộ nhớ nội bộ (Local Storage) của trình duyệt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
              <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-md mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-xs mb-0.5">
                  Bảo vệ mật khẩu thị giác (Anti-Shoulder Surfing)
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Mật khẩu luôn được che giấu mặc định dạng ký tự chấm tròn (••••••••). Bạn có thể bấm biểu tượng con mắt để xem hoặc bấm nút sao chép nhanh chỉ với 1 lần chạm.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
              <div className="p-1.5 bg-indigo-950 text-indigo-400 rounded-md mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-xs mb-0.5">
                  Sao lưu định kỳ đề phòng mất dữ liệu
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bạn có thể bấm nút <strong>"Sao lưu / Xuất"</strong> trên thanh tiêu đề để tải về file Excel/CSV hoặc JSON và cất giữ ở nơi an toàn.
                </p>
              </div>
            </div>
          </div>

          {/* Clear data danger zone */}
          <div className="border border-rose-900/40 bg-rose-950/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Xóa toàn bộ kho dữ liệu</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Thao tác này sẽ dọn sạch tất cả Gmail và khôi phục về trạng thái ban đầu.
                </p>
              </div>
              {!showConfirmClear ? (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  Xóa tất cả
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowConfirmClear(false);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
