import Container from "./Container";

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="border-b border-ink-100 bg-ink-50">
      <Container className="py-10 text-center sm:py-14">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-500 sm:text-base">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
