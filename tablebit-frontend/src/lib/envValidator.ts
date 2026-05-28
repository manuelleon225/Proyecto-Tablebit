const REQUIRED_VARS = ["VITE_API_URL", "VITE_APP_NAME"];

export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  REQUIRED_VARS.forEach((name) => {
    if (!import.meta.env[name]) missing.push(name);
  });
  if (missing.length > 0) {
    console.error(`[EnvValidator] Missing required env vars: ${missing.join(", ")}`);
  }
  return { valid: missing.length === 0, missing };
}
