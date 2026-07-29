export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initWatchup } = await import("@watchupltd/nextjs/server");
    initWatchup({
      apiKey: process.env.WATCHUP_API_KEY,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_GIT_SHA,
      logging: { enabled: true, minLevel: "info" },
    });
  }
}
