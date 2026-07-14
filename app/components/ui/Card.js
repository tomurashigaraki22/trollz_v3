export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
