const Dialog = ({ type = 'success', title, text, open = false, onClose }) => {
    if (!open) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed right-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm" role="status" aria-live="polite">
            <div className={`flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg ${isSuccess ? 'border-emerald-200' : 'border-rose-200'}`}>
                <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`} aria-hidden="true">
                    {isSuccess ? '✓' : '!'}
                </span>
                <div className="min-w-0 flex-1">
                    {title && <p className={`text-sm font-semibold ${isSuccess ? 'text-emerald-900' : 'text-rose-900'}`}>{title}</p>}
                    {text && <p className="mt-0.5 text-sm text-slate-600">{text}</p>}
                </div>
                {onClose && (
                    <button type="button" onClick={onClose} className="-mr-1 -mt-1 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification">
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default Dialog;