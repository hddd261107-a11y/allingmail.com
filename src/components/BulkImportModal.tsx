import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileCode,
  ArrowRight
} from 'lucide-react';
import { GmailAccount } from '../types';
import { parseBulkText } from '../utils/storage';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newAccounts: GmailAccount[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [inputText, setInputText] = useState('');
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'overwrite'>('skip');

  if (!isOpen) return null;

  const parsedItems = parseBulkText(inputText);

  const handleImport = () => {
    if (parsedItems.length === 0) return;

    const fullAccounts: GmailAccount[] = parsedItems.map((item, index) => ({
      id: `bulk-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      email: item.email || '',
      password: item.password || '',
      isActive: item.isActive ?? true,
      statusNote: item.isActive ? 'Đã nhập hàng loạt (Live)' : 'Đã nhập hàng loạt (Die)',
      linkedApps: item.linkedApps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    }));

    onImport(fullAccounts);
    onClose();
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Check if it's JSON
      if (file.name.endsWith('.json')) {
        try {
          const jsonParsed = JSON.parse(content);
          if (Array.isArray(jsonParsed)) {
            // Import directly
            onImport(jsonParsed);
            onClose();
            return;
          }
        } catch {
          // Fall back to text parse
        }
      }

      setInputText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Nhập hàng loạt nhiều Gmail & Mật khẩu
              </h2>
              <p className="text-xs text-slate-400">
                Thêm nhanh hàng chục hoặc hàng trăm tài khoản chỉ trong 1 lần dán
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
        <div className="p-5 space-y-4 flex-1">
          {/* Format guide */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Định dạng hỗ trợ (mỗi dòng 1 tài khoản):</span>
            </div>
            <code className="block bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-cyan-300 border border-slate-800 space-y-1">
              <div>email|matkhau</div>
              <div>email|matkhau|App1,App2</div>
              <div>sn261107@gmail.com|MatKhau!2026|Netflix,ChatGPT|live</div>
              <div>email2@gmail.com|Pass123|Steam|die</div>
            </code>
            <p className="text-[11px] text-slate-400 mt-2">
              (Hỗ trợ phân cách bằng dấu gạch đứng <span className="font-mono text-slate-300">|</span>, dấu phẩy <span className="font-mono text-slate-300">,</span> hoặc khoảng trắng)
            </p>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Dán danh sách tài khoản vào đây:
              </label>
              <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Hoặc chọn file .TXT / .CSV / .JSON</span>
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="VD:&#10;sn261107@gmail.com|P@ssSn2026|ChatGPT,Netflix|live&#10;user2@gmail.com|SecretPass123|Steam|live&#10;acc_die@gmail.com|OldPass123|TikTok|die"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-slate-200 rounded-xl p-3 font-mono outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Parse Preview Status */}
          {inputText && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Đã nhận diện: <strong className="text-white font-mono">{parsedItems.length}</strong> tài khoản
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">
                  {parsedItems.filter(p => p.isActive).length} còn dùng
                </span>
                <span className="text-rose-400">
                  {parsedItems.filter(p => !p.isActive).length} hỏng
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">Sẵn sàng nhập</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleImport}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Nhập {parsedItems.length > 0 ? `${parsedItems.length} tài khoản` : ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
