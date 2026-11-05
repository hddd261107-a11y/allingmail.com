import React from 'react';
import { 
  Search, 
  X, 
  Check, 
  X as XIcon, 
  ArrowUpDown, 
  LayoutList, 
  LayoutGrid, 
  Trash2, 
  CheckCheck,
  Ban
} from 'lucide-react';
import { StatusFilter, SortField } from '../types';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortField: SortField;
  onSortChange: (sort: SortField) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  selectedIds: string[];
  onBulkMarkActive: (active: boolean) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortChange,
  viewMode,
  onViewModeChange,
  selectedIds,
  onBulkMarkActive,
  onBulkDelete,
  onClearSelection,
  activeCount,
  inactiveCount,
  totalCount,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Streamlined Search and Status Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Clean, Full-Width Search Input (không cần ký tự nhanh) */}
        <div className="flex-1 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm Gmail hoặc mật khẩu (gõ 's' tìm sn261107@gmail.com)..."
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 rounded-lg pl-9 pr-8 py-2 font-mono outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs (Tất cả / ✓ Còn dùng / ✕ Hỏng) */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className="font-mono text-[11px] ml-1 opacity-70">({totalCount})</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('active')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
            title="Lọc tài khoản còn dùng được (✓)"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
              ✓
            </span>
            <span>Còn dùng</span>
            <span className="font-mono text-[11px] ml-0.5 opacity-70">({activeCount})</span>
          </button>

          <button
            onClick={() => onStatusFilterChange('inactive')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              statusFilter === 'inactive'
                ? 'bg-rose-950/80 border border-rose-800/80 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-rose-300'
            }`}
            title="Lọc tài khoản đã hỏng (✕)"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
              ✕
            </span>
            <span>Đã hỏng</span>
            <span className="font-mono text-[11px] ml-0.5 opacity-70">({inactiveCount})</span>
          </button>
        </div>

        {/* Sort & View toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => onSortChange(e.target.value as SortField)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg pl-2 pr-6 py-2 focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer font-medium"
              title="Sắp xếp"
            >
              <option value="email-asc">A → Z</option>
              <option value="email-desc">Z → A</option>
              <option value="status-active-first">Còn dùng (✓) trước</option>
              <option value="date-desc">Mới nhất</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dạng bảng"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dạng thẻ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3.5 py-2 flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Đã chọn:</span>
            <span className="bg-cyan-500/20 text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 text-[11px]">
              {selectedIds.length} mục
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onBulkMarkActive(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-colors text-xs"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Tích: ✓ Còn dùng</span>
            </button>

            <button
              onClick={() => onBulkMarkActive(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white font-medium transition-colors text-xs"
            >
              <Ban className="w-3 h-3" />
              <span>Tích: ✕ Đã hỏng</span>
            </button>

            <button
              onClick={onBulkDelete}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white font-medium transition-colors text-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa</span>
            </button>

            <button
              onClick={onClearSelection}
              className="text-slate-400 hover:text-white px-2 py-1 text-xs"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
