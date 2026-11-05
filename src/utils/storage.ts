import { GmailAccount } from '../types';

const STORAGE_KEY = 'gmail_vault_accounts_v1';
const SETTINGS_KEY = 'gmail_vault_settings_v1';

export const POPULAR_APPS = [
  'Netflix',
  'ChatGPT / OpenAI',
  'Claude AI',
  'Canva Pro',
  'CapCut',
  'Steam',
  'Discord',
  'TikTok',
  'Facebook',
  'Spotify',
  'Telegram',
  'YouTube Premium',
  'Google Drive 2TB',
  'GitHub',
  'Adobe CC',
  'App Store / ChPlay',
];

// Initial seeded accounts to demonstrate the application immediately
const INITIAL_SAMPLE_ACCOUNTS: GmailAccount[] = [
  {
    id: 'seed-sn261107',
    email: 'sn261107@gmail.com',
    password: 'P@ssw0rd!Sn2026#Secure',
    isActive: true,
    statusNote: 'Hoạt động tốt - Đang dùng chính',
    linkedApps: ['ChatGPT / OpenAI', 'Netflix', 'Canva Pro'],
    recoveryEmail: 'backup.sn26@gmail.com',
    recoveryPhone: '0987654321',
    twoFactorKey: 'ABCD-EFGH-1234-5678',
    note: 'Tài khoản chính đăng nhập các app công việc và giải trí',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-11-04T10:00:00.000Z',
    lastCheckedAt: '2026-11-04T10:00:00.000Z',
  },
  {
    id: 'seed-alexwork',
    email: 'alex.designer@gmail.com',
    password: 'K9#vX$m8Q2pL!zR5',
    isActive: true,
    statusNote: 'Hoạt động bình thường',
    linkedApps: ['Canva Pro', 'Adobe CC', 'CapCut'],
    recoveryEmail: 'support.design@outlook.com',
    note: 'Acc dùng Canva Pro chia sẻ team đồ hoạ',
    createdAt: '2026-04-12T09:30:00.000Z',
    updatedAt: '2026-10-15T14:20:00.000Z',
    lastCheckedAt: '2026-10-15T14:20:00.000Z',
  },
  {
    id: 'seed-stream-netflix',
    email: 'stream.cinema.4k@gmail.com',
    password: 'M@xStream9988!!',
    isActive: true,
    statusNote: 'Gói 4K UHD gia hạn hàng tháng',
    linkedApps: ['Netflix', 'Spotify'],
    note: 'Tài khoản phụ xem phim trên TV phòng khách',
    createdAt: '2026-05-18T11:00:00.000Z',
    updatedAt: '2026-10-28T09:15:00.000Z',
  },
  {
    id: 'seed-gaming-steam',
    email: 'gaming.master.asia@gmail.com',
    password: 'Game#2026*PlayHard',
    isActive: true,
    statusNote: 'Còn sài tốt',
    linkedApps: ['Steam', 'Discord'],
    recoveryPhone: '0912345678',
    note: 'Acc game Steam chứa CS:GO, Black Myth Wukong',
    createdAt: '2026-06-05T16:45:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'seed-social-old',
    email: 'social.temp.promo@gmail.com',
    password: 'OldPassword123#',
    isActive: false, // Inactive / Die
    statusNote: 'Bị khóa xác minh số điện thoại cũ',
    linkedApps: ['TikTok', 'Facebook'],
    note: 'Tài khoản cũ đã die, không lấy lại được mã SMS',
    createdAt: '2026-01-10T07:20:00.000Z',
    updatedAt: '2026-08-11T18:30:00.000Z',
    lastCheckedAt: '2026-08-11T18:30:00.000Z',
  },
  {
    id: 'seed-beta-tester',
    email: 'beta.tester.ai@gmail.com',
    password: 'DevPrompt!2026$Ai',
    isActive: true,
    statusNote: 'Hoạt động tốt',
    linkedApps: ['Claude AI', 'ChatGPT / OpenAI', 'GitHub'],
    note: 'Dùng đăng ký thử nghiệm các mô hình AI mới',
    createdAt: '2026-07-22T13:10:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'seed-video-capcut',
    email: 'video.editor.pro@gmail.com',
    password: 'CutVideo#2026!Pro',
    isActive: false,
    statusNote: 'Hết hạn gói Pro - Cần gia hạn',
    linkedApps: ['CapCut', 'TikTok'],
    note: 'Acc chuyên edit video ngắn Reels & TikTok',
    createdAt: '2026-08-01T15:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
  },
  {
    id: 'seed-storage-drive',
    email: 'storage.cloud.backup@gmail.com',
    password: 'DriveStorage#2TB!2026',
    isActive: true,
    statusNote: 'Hoạt động tốt - Còn 1.4TB trống',
    linkedApps: ['Google Drive 2TB', 'YouTube Premium'],
    note: 'Lưu trữ tài liệu ảnh gia đình & video backup',
    createdAt: '2026-02-14T09:00:00.000Z',
    updatedAt: '2026-11-02T19:00:00.000Z',
  }
];

export function getStoredAccounts(): GmailAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ACCOUNTS));
      return INITIAL_SAMPLE_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_ACCOUNTS;
  } catch (e) {
    console.error('Failed to load accounts from storage:', e);
    return INITIAL_SAMPLE_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: GmailAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage:', e);
  }
}

export function exportAccountsToJSON(accounts: GmailAccount[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(accounts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `gmail_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportAccountsToCSV(accounts: GmailAccount[]): void {
  const headers = ['Email', 'Mật khẩu', 'Trạng thái', 'Ứng dụng liên kết', 'Email khôi phục', 'SĐT', 'Ghi chú', 'Ngày tạo'];
  const rows = accounts.map(acc => [
    `"${acc.email.replace(/"/g, '""')}"`,
    `"${acc.password.replace(/"/g, '""')}"`,
    acc.isActive ? '"Còn dùng được"' : '"Đã hỏng / Die"',
    `"${acc.linkedApps.join(', ').replace(/"/g, '""')}"`,
    `"${(acc.recoveryEmail || '').replace(/"/g, '""')}"`,
    `"${(acc.recoveryPhone || '').replace(/"/g, '""')}"`,
    `"${(acc.note || '').replace(/"/g, '""')}"`,
    `"${acc.createdAt}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `gmail_vault_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

// Bulk text parse helper (formats: email|pass, email|pass|apps, email,pass, etc.)
export function parseBulkText(text: string): Partial<GmailAccount>[] {
  const lines = text.split('\n');
  const results: Partial<GmailAccount>[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Detect separator (| or , or tab or colon or space)
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(s => s.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(s => s.trim());
    } else if (line.includes(',')) {
      parts = line.split(',').map(s => s.trim());
    } else if (line.includes(':') && line.indexOf(':') === line.lastIndexOf(':')) {
      parts = line.split(':').map(s => s.trim());
    } else {
      parts = line.split(/\s+/).map(s => s.trim());
    }

    if (parts.length >= 2) {
      const email = parts[0];
      const password = parts[1];
      const appsStr = parts[2] || '';
      const statusStr = (parts[3] || '').toLowerCase();

      const linkedApps = appsStr
        ? appsStr.split(/[,;/]/).map(a => a.trim()).filter(Boolean)
        : [];

      // Determine active: true if not explicitly "die" or "0" or "hong"
      const isDie = statusStr === 'die' || statusStr === 'hong' || statusStr === '0' || statusStr === 'false' || statusStr.includes('hỏng');
      const isActive = !isDie;

      if (email.includes('@')) {
        results.push({
          email,
          password,
          linkedApps,
          isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  return results;
}
