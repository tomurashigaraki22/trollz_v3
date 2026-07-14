// lucide-react no longer ships trademarked brand glyphs, so these small
// outline icons are hand-rolled to keep the footer dependency-free.

export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M14 9V6.5A1.5 1.5 0 0 1 15.5 5H17V2h-2.5A4.5 4.5 0 0 0 10 6.5V9H7v3h3v10h4V12h3.2l.8-3H14Z" strokeLinejoin="round" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
    </svg>
  );
}
