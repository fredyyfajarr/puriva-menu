export function getMidtransEnv() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  const notificationUrl = process.env.MIDTRANS_NOTIFICATION_URL;

  return {
    serverKey,
    isProduction,
    apiBaseUrl: isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
    appUrl: appUrl ? (appUrl.startsWith("http") ? appUrl : `https://${appUrl}`) : null,
    notificationUrl,
    isConfigured: Boolean(serverKey),
  };
}
