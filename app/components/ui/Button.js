import Link from "next/link";

const variants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500",
  dark: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:outline-ink-900",
  outline:
    "border border-ink-300 text-ink-800 hover:border-ink-900 hover:text-ink-900 focus-visible:outline-ink-900",
  ghost: "text-ink-700 hover:bg-ink-100 focus-visible:outline-ink-300",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export default function Button({
  as,
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-200 outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  const Tag = as ?? (href ? Link : "button");

  if (Tag === Link) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Tag className={classes} href={href} {...props}>
      {children}
    </Tag>
  );
}
