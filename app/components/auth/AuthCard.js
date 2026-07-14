import Link from "next/link";
import Container from "../ui/Container";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <section className="flex min-h-[75vh] items-center bg-ink-50 py-14">
      <Container className="flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-ink-900">
            Trollz<span className="text-brand-500">Store</span>
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </Container>
    </section>
  );
}
