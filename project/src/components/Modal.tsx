import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export default function Modal({ isOpen, onClose, title, description, children, size = 'md', variant = 'default' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidth = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl';
  const isWhite = variant === 'white';
  const shellClass = isWhite
    ? 'border-slate-200 bg-white/95 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)]'
    : 'border-white/10 bg-[#030712]/95 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]';
  const overlayClass = isWhite ? 'bg-slate-900/45' : 'bg-black/75';
  const closeButtonClass = isWhite
    ? 'border-slate-200 bg-white text-slate-700 hover:text-slate-950'
    : 'border-white/10 bg-slate-900/70 text-slate-300 hover:text-white';
  const titleClass = isWhite ? 'text-slate-900' : 'text-white';
  const descriptionClass = isWhite ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-3 backdrop-blur-sm sm:p-4 ${overlayClass}`} onClick={onClose}>
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-[1.5rem] border p-5 sm:p-6 ${shellClass}`}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-3 top-3 rounded-full border p-2 transition ${closeButtonClass}`}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="pr-10">
          <h3 className={`text-lg font-semibold ${titleClass}`}>{title}</h3>
          {description && <p className={`mt-1 text-sm ${descriptionClass}`}>{description}</p>}
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
