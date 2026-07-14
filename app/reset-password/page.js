import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  return <ResetPasswordForm token={token} />;
}
