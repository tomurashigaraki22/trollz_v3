import Container from "./Container";

export default function Section({
  className = "",
  containerClassName = "",
  children,
  ...props
}) {
  return (
    <section className={`py-12 sm:py-16 ${className}`} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
