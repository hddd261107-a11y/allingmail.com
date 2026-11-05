import React, { useState, useMemo } from 'react';
import { 
  getStoredAccounts, 
  saveStoredAccounts, 
  exportAccountsToCSV, 
  exportAccountsToJSON 
} from './utils/storage';
import { 
  GmailAccount, 
  StatusFilter, 
  SortField, 
  VaultStats 
} from './types';
import { Header } from './components/Header';
import { FilterToolbar } from './components/FilterToolbar';
import { AccountList } from './components/AccountList';
import { AccountModal } from './components/AccountModal';
import { BulkImportModal } from './components/BulkImportModal';
import { UploadScanModal } from './components/UploadScanModal';
import { SecurityDrawer } from './components/SecurityDrawer';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [accounts, setAccounts] = useState<GmailAccount[]>(() => getStoredAccounts());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('email-asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GmailAccount | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isUploadScanOpen, setIsUploadScanOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Sync state to LocalStorage
  const updateAccounts = (newAccounts: GmailAccount[]) => {
    setAccounts(newAccounts);
    saveStoredAccounts(newAccounts);
  };

  // Compute Vault Statistics
  const stats: VaultStats = useMemo(() => {
    const activeCount = accounts.filter((a) => a.isActive).length;
    const inactiveCount = accounts.length - activeCount;
    return {
      total: accounts.length,
      activeCount,
      inactiveCount,
      totalAppsLinked: 0,
    };
  }, [accounts]);

  // Filter & Sort Pipeline
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((acc) => {
        const emailLower = acc.email.toLowerCase();

        // 1. Status Filter (Còn dùng / Đã hỏng)
        if (statusFilter === 'active' && !acc.isActive) return false;
        if (statusFilter === 'inactive' && acc.isActive) return false;

        // 2. Instant Search & Symbol matching
        // (Gõ 's' tìm 'sn261107@gmail.com' ngay lập tức)
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const matchEmail = emailLower.includes(query);
          const matchNote = acc.note?.toLowerCase().includes(query) || false;
          const matchStatusNote = acc.statusNote?.toLowerCase().includes(query) || false;
          if (!matchEmail && !matchNote && !matchStatusNote) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortField) {
          case 'email-asc':
            return a.email.localeCompare(b.email);
          case 'email-desc':
            return b.email.localeCompare(a.email);
          case 'status-active-first':
            if (a.isActive === b.isActive) {
              return a.email.localeCompare(b.email);
            }
            return a.isActive ? -1 : 1;
          case 'date-desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'date-asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [accounts, statusFilter, searchQuery, sortField]);

  // Handle direct 1-click status checkbox toggle ("còn sài dc hay o")
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const updated = accounts.map((acc) => {
      if (acc.id === id) {
        return {
          ...acc,
          isActive: newStatus,
          statusNote: newStatus ? 'Còn dùng được' : 'Đã hỏng / Die',
          lastCheckedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return acc;
    });
    updateAccounts(updated);
    showToast(
      newStatus ? '✓ Đã tích: Tài khoản còn dùng được!' : '✗ Đã tích: Tài khoản đã hỏng / Die',
      'success'
    );
  };

  // Direct inline password update
  const handleUpdatePassword = (id: string, newPassword: string) => {
    const updated = accounts.map((acc) => {
      if (acc.id === id) {
        return {
          ...acc,
          password: newPassword,
          updatedAt: new Date().toISOString(),
        };
      }
      return acc;
    });
    updateAccounts(updated);
  };

  // Add or Edit Account
  const handleSaveAccount = (
    data: Omit<GmailAccount, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updated = accounts.map((acc) => {
        if (acc.id === existingId) {
          return {
            ...acc,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
        return acc;
      });
      updateAccounts(updated);
      showToast('Đã cập nhật thông tin tài khoản!', 'success');
    } else {
      const newAccount: GmailAccount = {
        ...data,
        id: `gmail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateAccounts([newAccount, ...accounts]);
      showToast(`Đã thêm ${newAccount.email} thành công!`, 'success');
    }
  };

  // Delete single account
  const handleDeleteAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản ${acc.email}?`)) {
      updateAccounts(accounts.filter((a) => a.id !== id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
      showToast('Đã xóa tài khoản!', 'info');
    }
  };

  // Bulk actions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedIds(filteredAccounts.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkMarkActive = (active: boolean) => {
    const updated = accounts.map((acc) => {
      if (selectedIds.includes(acc.id)) {
        return {
          ...acc,
          isActive: active,
          statusNote: active ? 'Đã đổi: Còn dùng được' : 'Đã đổi: Hỏng / Die',
          updatedAt: new Date().toISOString(),
        };
      }
      return acc;
    });
    updateAccounts(updated);
    showToast(
      `Đã chuyển ${selectedIds.length} tài khoản sang "${active ? 'Còn dùng được' : 'Hỏng / Die'}"`,
      'success'
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedIds.length} tài khoản đã chọn?`)) {
      updateAccounts(accounts.filter((a) => !selectedIds.includes(a.id)));
      showToast(`Đã xóa ${selectedIds.length} tài khoản`, 'info');
      setSelectedIds([]);
    }
  };

  // Import bulk accounts from text
  const handleBulkImport = (newAccounts: GmailAccount[]) => {
    const existingEmails = new Set(accounts.map((a) => a.email.toLowerCase()));
    const nonDuplicates = newAccounts.filter((a) => !existingEmails.has(a.email.toLowerCase()));
    const merged = [...nonDuplicates, ...accounts];
    updateAccounts(merged);
    showToast(`Đã nhập thành công ${nonDuplicates.length} tài khoản mới!`, 'success');
  };

  // Import extracted Gmails from screenshot or uploaded file
  // (User can then easily type passwords & toggle status)
  const handleImportScannedGmails = (scannedEmails: string[]) => {
    const existingEmails = new Set(accounts.map((a) => a.email.toLowerCase()));
    const newItems: GmailAccount[] = [];

    scannedEmails.forEach((email, index) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!existingEmails.has(cleanEmail)) {
        newItems.push({
          id: `scan-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
          email: cleanEmail,
          password: '', // Blank password, user will enter
          isActive: true, // Default to còn dùng được
          statusNote: 'Tải từ ảnh chụp màn hình',
          linkedApps: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      updateAccounts([...newItems, ...accounts]);
      showToast(`Đã thêm ${newItems.length} Gmail từ ảnh vào danh sách!`, 'success');
    } else {
      showToast('Các Gmail này đã có sẵn trong danh sách!', 'info');
    }
  };

  // Reset data to defaults
  const handleClearAllData = () => {
    localStorage.removeItem('gmail_vault_accounts_v1');
    const fresh = getStoredAccounts();
    setAccounts(fresh);
    setSelectedIds([]);
    showToast('Đã làm mới dữ liệu về mặc định', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Streamlined Top Header */}
      <Header
        stats={stats}
        onOpenAddModal={() => {
          setEditingAccount(null);
          setIsAccountModalOpen(true);
        }}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onOpenUploadScan={() => setIsUploadScanOpen(true)}
        onExportCSV={() => exportAccountsToCSV(accounts)}
        onExportJSON={() => exportAccountsToJSON(accounts)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Streamlined Search with Quick Symbols & Status Filter */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortField={sortField}
          onSortChange={setSortField}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedIds={selectedIds}
          onBulkMarkActive={handleBulkMarkActive}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
          activeCount={stats.activeCount}
          inactiveCount={stats.inactiveCount}
          totalCount={stats.total}
        />

        {/* Counter & Instruction Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <strong className="font-mono text-cyan-400 font-semibold">{filteredAccounts.length}</strong>
            <span>trên</span>
            <strong className="font-mono text-slate-200">{accounts.length}</strong>
            <span>tài khoản</span>

            {searchQuery && (
              <span className="bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 text-[11px] font-mono">
                Lọc: "{searchQuery}"
              </span>
            )}
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <span>Bấm vào nút</span>
            <span className="text-emerald-400 font-bold">✓</span>
            <span>/</span>
            <span className="text-rose-400 font-bold">✕</span>
            <span>để đổi trạng thái dùng được hay hỏng.</span>
          </div>
        </div>

        {/* Accounts List (Table or Grid) */}
        <AccountList
          accounts={filteredAccounts}
          searchQuery={searchQuery}
          viewMode={viewMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onToggleActive={handleToggleActive}
          onUpdatePassword={handleUpdatePassword}
          onEditAccount={(acc) => {
            setEditingAccount(acc);
            setIsAccountModalOpen(true);
          }}
          onDeleteAccount={handleDeleteAccount}
          onShowToast={showToast}
        />
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 shadow-2xl text-xs font-semibold text-white animate-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dedicated Upload Screenshot / File Modal */}
      <UploadScanModal
        isOpen={isUploadScanOpen}
        onClose={() => setIsUploadScanOpen(false)}
        onImportGmails={handleImportScannedGmails}
        onShowToast={showToast}
      />

      {/* Add / Edit Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Security Info Modal */}
      <SecurityDrawer
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
