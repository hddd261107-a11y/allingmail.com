import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  Copy, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  ClipboardPaste,
  Eye
} from 'lucide-react';
import { GmailAccount } from '../types';

interface UploadScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGmails: (gmails: string[]) => void;
  onShowToast: (message: string, type?: 'success' | 'info') => void;
}

export const UploadScanModal: React.FC<UploadScanModalProps> = ({
  isOpen,
  onClose,
  onImportGmails,
  onShowToast,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedGmails, setDetectedGmails] = useState<string[]>([]);
  const [selectedGmails, setSelectedGmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle paste from clipboard (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        } else if (items[i].type === 'text/plain') {
          items[i].getAsString((text) => {
            extractEmailsFromText(text);
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  // Process image file (from upload, drop, or paste)
  const processImageFile = async (file: File) => {
    setError(null);
    setIsScanning(true);
    setDetectedGmails([]);
    setSelectedGmails([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setImagePreview(base64Data);

      try {
        const response = await fetch('/api/extract-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/png',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Không thể quét hình ảnh');
        }

        const emails = data.emails || [];
        setDetectedGmails(emails);
        setSelectedGmails(emails);

        if (emails.length > 0) {
          onShowToast(`Tìm thấy ${emails.length} địa chỉ Gmail từ ảnh!`, 'success');
        } else {
          setError('Không tìm thấy địa chỉ Gmail nào trong bức ảnh này. Vui lòng thử ảnh chụp rõ hơn.');
        }
      } catch (err: any) {
        console.error('Scan error:', err);
        setError(err.message || 'Lỗi khi quét ảnh. Vui lòng thử lại.');
      } finally {
        setIsScanning(false);
      }
    };

    reader.onerror = () => {
      setIsScanning(false);
      setError('Lỗi khi đọc file ảnh.');
    };

    reader.readAsDataURL(file);
  };

  // Process text or CSV file
  const processTextFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      extractEmailsFromText(text);
    };
    reader.readAsText(file);
  };

  const extractEmailsFromText = (text: string) => {
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (matches) {
      const unique = Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
      setDetectedGmails(unique);
      setSelectedGmails(unique);
      setImagePreview(null);
      onShowToast(`Tìm thấy ${unique.length} địa chỉ Gmail từ tệp!`, 'success');
    } else {
      setError('Không tìm thấy địa chỉ Gmail nào trong văn bản.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      processTextFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      processTextFile(file);
    }
  };

  const handleCopyAll = async () => {
    if (detectedGmails.length === 0) return;
    const textToCopy = selectedGmails.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      onShowToast(`Đã sao chép ${selectedGmails.length} địa chỉ Gmail!`, 'success');
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      onShowToast('Không thể sao chép vào bộ nhớ tạm', 'info');
    }
  };

  const handleImportToVault = () => {
    if (selectedGmails.length === 0) return;
    onImportGmails(selectedGmails);
    onShowToast(`Đã cập nhật ${selectedGmails.length} Gmail vào danh sách!`, 'success');
    onClose();
  };

  const toggleSelectEmail = (email: string) => {
    setSelectedGmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleReset = () => {
    setImagePreview(null);
    setDetectedGmails([]);
    setSelectedGmails([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Tải tệp hoặc Ảnh chụp màn hình
              </h2>
              <p className="text-[11px] text-slate-400">
                Tự động nhận diện danh sách Gmail từ ảnh chụp màn hình để sao chép & cập nhật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 text-xs">
          {/* Upload Dropzone */}
          {!imagePreview && detectedGmails.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-400/80 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.txt,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 flex items-center justify-center mx-auto text-slate-400 group-hover:text-cyan-400 mb-3 transition-colors shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                Bấm vào đây để chọn ảnh chụp màn hình hoặc tệp
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-3">
                Kéo thả ảnh vào đây, hoặc nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono text-[11px]">Ctrl + V</kbd> để dán trực tiếp ảnh vừa chụp màn hình
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <span>Hỗ trợ: Ảnh chụp (.png, .jpg), Tệp (.txt, .csv)</span>
              </div>
            </div>
          )}

          {/* Scanning loader */}
          {isScanning && (
            <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">
                Đang nhận diện Gmail từ ảnh chụp màn hình...
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hệ thống đang quét tất cả tài khoản Gmail xuất hiện trong ảnh của bạn.
              </p>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleReset}
                className="underline text-slate-300 hover:text-white shrink-0 text-[11px]"
              >
                Chọn ảnh khác
              </button>
            </div>
          )}

          {/* Scan Results */}
          {detectedGmails.length > 0 && (
            <div className="space-y-3 animate-in fade-in">
              {/* Image Preview & Summary Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <div className="relative group shrink-0">
                      <img
                        src={imagePreview}
                        alt="Ảnh chụp màn hình"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">
                        Đã tìm thấy <span className="text-cyan-400 font-mono">{detectedGmails.length}</span> tài khoản Gmail!
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bạn có thể sao chép tất cả hoặc bấm Cập nhật để tự nhập mật khẩu & tích trạng thái.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white underline shrink-0"
                >
                  Tải ảnh khác
                </button>
              </div>

              {/* List of extracted Gmails with checkboxes */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedGmails.length === detectedGmails.length}
                      onChange={(e) =>
                        setSelectedGmails(e.target.checked ? [...detectedGmails] : [])
                      }
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-cyan-500 cursor-pointer"
                    />
                    <span>
                      Đã chọn: <strong className="text-white font-mono">{selectedGmails.length}</strong> / {detectedGmails.length} Gmail
                    </span>
                  </div>
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? 'Đã sao chép' : 'Sao chép tất cả'}</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60 p-1">
                  {detectedGmails.map((email, idx) => {
                    const isSelected = selectedGmails.includes(email);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelectEmail(email)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-900/90' : 'hover:bg-slate-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 font-mono text-xs">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectEmail(email)}
                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-cyan-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-slate-100 font-medium">{email}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-sans">
                          Sẵn sàng cập nhật
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informative instruction note */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">ℹ</span>
                <div>
                  <strong className="text-slate-200">Bước tiếp theo:</strong> Sau khi bấm nút bên dưới, các Gmail này sẽ được đưa vào danh sách chính của bạn với dấu tích <strong>"Còn dùng được"</strong>. Bạn chỉ cần bấm vào ô mật khẩu để nhập mật khẩu hoặc tích hỏng nếu muốn.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {detectedGmails.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Sao chép {selectedGmails.length} Gmail</span>
              </button>
            )}

            <button
              type="button"
              disabled={selectedGmails.length === 0}
              onClick={handleImportToVault}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Cập nhật {selectedGmails.length} Gmail vào app</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
