import { runProductionCertification } from "../src/lib/productionCertification";
import { validateEnvironment } from "../src/lib/envValidator";

async function main() {
  console.log("🔍 Production Health Check");

  const env = validateEnvironment();
  if (!env.valid) {
    console.error(`❌ Environment: missing ${env.missing.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ Environment: valid");

  const cert = runProductionCertification();
  if (!cert.passed) {
    console.error(`❌ Certification: failed (score: ${cert.score})`);
    process.exit(1);
  }
  console.log(`✅ Certification: passed (${cert.score}/100)`);

  console.log("✅ Production health check passed");
}

main().catch((e) => {
  console.error("❌ Health check failed:", e);
  process.exit(1);
});
