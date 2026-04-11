export const runtime = "nodejs";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const dns = await import("node:dns");

  // College network blocks SRV DNS lookups; use Google DNS instead.
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
