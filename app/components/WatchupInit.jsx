"use client";

import dynamic from "next/dynamic";

const WatchupProvider = dynamic(
  () => import("@watchupltd/nextjs/client").then((m) => m.WatchupProvider),
  { ssr: false }
);

export default function WatchupInit({ children }) {
  return (
    <WatchupProvider
      apiKey={process.env.NEXT_PUBLIC_WATCHUP_API_KEY}
      options={{
        environment: process.env.NODE_ENV,
        release: process.env.NEXT_PUBLIC_GIT_SHA,
        flushInterval: 5000,
        maxBatchSize: 25,
        autoCapture: { errors: true, performance: true, pageViews: true },
        logging: {
          enabled: true,
          captureConsole: true,
          includeDeviceContext: true,
          minLevel: "debug",
        },
      }}
    >
      {children}
    </WatchupProvider>
  );
}
