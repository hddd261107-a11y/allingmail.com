import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Upload, 
  Download, 
  KeyRound, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { VaultStats } from '../types';

interface HeaderProps {
  stats: VaultStats;
  onOpenAddModal: () => void;
  onOpenBulkImport: () => void;
  onOpenUploadScan: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenSecurityModal: () => void;
  isVaultEncrypted?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenAddModal,
  onOpenBulkImport,
  onOpenUploadScan,
  onExportCSV,
  onExportJSON,
  onOpenSecurityModal,
  isVaultEncrypted = false,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-15">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                A-Gmail
              </span>
              <span className="text-[11px] text-slate-400 block -mt-1 font-mono">
                Quản lý Gmail & Mật khẩu
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-300">
            {/* Dedicated Upload Screenshot / File Button */}
            <button
              onClick={onOpenUploadScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Tải ảnh chụp màn hình hoặc tệp để tự động lấy Gmail"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tải tệp / Ảnh chụp</span>
            </button>

            <button
              onClick={onOpenBulkImport}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Nhập văn bản hàng loạt"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Dán danh sách</span>
            </button>

            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Tải về file sao lưu Excel hoặc JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Xuất file</span>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 w-44 flex flex-col gap-0.5">
                  <button
                    onClick={onExportCSV}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded text-left transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Xuất file Excel / CSV</span>
                  </button>
                  <button
                    onClick={onExportJSON}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded text-left transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Xuất file JSON sao lưu</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSecurityModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Thông tin lưu trữ & bảo mật trên máy"
            >
              {isVaultEncrypted ? (
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Bảo mật</span>
            </button>

            {/* Zone 3: Primary CTA */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all active:scale-[0.98] whitespace-nowrap ml-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined KPI strip */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-5 sm:gap-7 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Tổng Gmail:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {stats.total}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Còn dùng được:</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {stats.activeCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-slate-400">Đã hỏng / Die:</span>
              <span className="font-mono font-bold text-rose-400 tabular-nums">
                {stats.inactiveCount}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>100% Offline & Bảo mật tại thiết bị</span>
          </div>
        </div>
      </div>
    </header>
  );
};
