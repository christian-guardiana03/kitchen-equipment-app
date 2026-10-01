const LoadingSpinner = ({ text = 'Loading...', loading }) => {
    if (!loading) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label={text}
        >
            <div className="flex min-w-44 flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-xl ring-1 ring-slate-900/10">
                <div
                    aria-hidden="true"
                    className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"
                />
                <p className="text-sm font-medium text-slate-700">{text}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;