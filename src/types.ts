export type AccountStatus = 'active' | 'inactive';

export interface GmailAccount {
  id: string;
  email: string;
  password: string;
  isActive: boolean; // true = Còn dùng được, false = Hỏng / Không dùng được
  statusNote?: string; // Ghi chú trạng thái (VD: Live, Cần đổi mật khẩu, Checkpoint...)
  linkedApps: string[]; // Danh sách ứng dụng đăng nhập (VD: Netflix, ChatGPT, Steam, TikTok...)
  recoveryEmail?: string;
  recoveryPhone?: string;
  twoFactorKey?: string; // 2FA hoặc Backup codes
  note?: string; // Ghi chú bổ sung
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
}

export type AlphabetFilter = 'ALL' | 'NUM' | string;

export type StatusFilter = 'all' | 'active' | 'inactive';

export type SortField = 'email-asc' | 'email-desc' | 'date-desc' | 'date-asc' | 'status-active-first' | 'apps-count';

export interface VaultStats {
  total: number;
  activeCount: number;
  inactiveCount: number;
  totalAppsLinked: number;
}
