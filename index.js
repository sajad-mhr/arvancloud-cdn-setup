require("dotenv").config();
const axios = require("axios");
const readline = require("readline");

// === API Client ===
const api = axios.create({
  baseURL: "https://napi.arvancloud.ir/cdn/4.0",
  headers: {
    Authorization: `Apikey ${process.env.ARVAN_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// === Helper functions ===
function parseBool(value) {
  return value === "true";
}

// === Env variables ===
const domain = process.env.DOMAIN;
const domainType = process.env.DOMAIN_TYPE;
const planLevel = parseInt(process.env.PLAN_LEVEL);

const DNSNames = process.env.DNS_NAME.split(",").map((name) => name.trim());
const originHost = process.env.ORIGIN_HOST;
const httpsRedirect = parseBool(process.env.HTTPS_REDIRECT);

if (!domain) {
  console.error("❌ Please set DOMAIN in .env");
  process.exit(1);
}

// === Functions ===
async function addDomain() {
  try {
    const body = { domain, domain_type: domainType };
    if (domainType === "partial") body.plan_level = planLevel;

    console.log(`➡️ Adding domain: ${domain} (type: ${domainType})`);
    await api.post("/domains/dns-service", body);
    console.log(`✅ Domain added successfully: ${domain}`);
  } catch (err) {
    console.error(
      "❌ Failed to add domain:",
      err.response?.data || err.message,
    );
    process.exit(1);
  }
}

async function waitForActivation(timeout = 3600000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await api.get(`/domains/${domain}`);
    const status = res.data?.data?.status;

    console.log("🔍 Domain status:", status);

    if (status === "active") {
      console.log("✅ Domain is active!");
      return true;
    }

    await new Promise((r) => setTimeout(r, 60000));
  }
  throw new Error("Domain activation timeout");
}

async function addDNS() {
  await waitForActivation();
  try {
    for (const name of DNSNames) {
      const record = {
        type: "A",
        name: name,
        value: [{ country: "", ip: originHost, port: null, weight: null }],
        ttl: 120,
        cloud: true,
        upstream_https: "default",
        ip_filter_mode: { count: "single", geo_filter: "none", order: "none" },
      };

      console.log(
        `➡️ Adding DNS record for ${domain} -> ${name} = ${originHost}`,
      );
      await api.post(`/domains/${domain}/dns-records`, record);
      console.log(`✅ DNS record created successfully: ${name}`);
    }
  } catch (err) {
    console.error("❌ Failed to add DNS:", err.response?.data || err.message);
    process.exit(1);
  }
}

async function waitForSslIssued(timeout = 3600000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    console.log(`🔍 Checking SSL issuance status for domain: ${domain}`);
    try {
      const { data } = await api.get(`/domains/${domain}/ssl`);
      const certificates = data?.data?.certificates;
      if (Array.isArray(certificates) && certificates.length > 0) {
        console.log("✅ SSL certificate issued!");
        return certificates;
      }
    } catch (err) {
      console.error(
        "❌ Error checking SSL issuance:",
        err.response?.data || err.message,
      );
    }

    console.log("⏳ SSL not issued yet, waiting...");
    await new Promise((r) => setTimeout(r, 60000));
  }
  throw new Error("SSL issuance timeout.");
}

async function configureSSL() {
  await waitForSslIssued();
  try {
    const body = { ssl_status: true, https_redirect: httpsRedirect };
    console.log(`➡️ Configuring SSL for: ${domain}`);
    const res = await api.patch(`/domains/${domain}/ssl`, body);
    console.log("✅ SSL configured successfully!");
  } catch (err) {
    console.error(
      "❌ Failed to configure SSL:",
      err.response?.data || err.message,
    );
    process.exit(1);
  }
}

// === CLI Menu ===
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`
Select an option:
1 - Run All
2 - Add Domain
3 - Add DNS
4 - Configure SSL
`);

rl.question("Enter your choice: ", async (answer) => {
  try {
    switch (answer.trim()) {
      case "1":
        await addDomain();
        await waitForActivation();
        await addDNS();
        await waitForSslIssued();
        await configureSSL();
        console.log(
          `🎉 All steps completed successfully for domain: ${domain}`,
        );
        break;
      case "2":
        await addDomain();
        console.log(`✅ Domain added successfully: ${domain}`);
        break;
      case "3":
        await addDNS();
        console.log(`✅ DNS records added successfully for domain: ${domain}`);
        break;
      case "4":
        await configureSSL();
        console.log(`✅ SSL configured successfully for domain: ${domain}`);
        break;
      default:
        console.log("❌ Invalid choice");
    }
  } catch (err) {
    console.error("❌ Error during execution:", err.message);
  } finally {
    rl.close();
  }
});
