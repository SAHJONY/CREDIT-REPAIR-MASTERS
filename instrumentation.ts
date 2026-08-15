export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log(JSON.stringify({
      level: "info",
      service: "credit-repair-masters",
      event: "runtime.register",
      version: "1.1.0",
      environment: process.env.VERCEL_ENV || process.env.APP_ENV || "local"
    }));
  }
}
