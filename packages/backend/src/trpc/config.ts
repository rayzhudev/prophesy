import { PrivyClient } from "@privy-io/server-auth";

const REQUIRED_ENV_VARS = {
  PRIVY_APP_ID: process.env.PRIVY_APP_ID,
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
} as const;

// Validate all required environment variables
Object.entries(REQUIRED_ENV_VARS).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
});

// Initialize Privy client
if (!REQUIRED_ENV_VARS.PRIVY_APP_ID || !REQUIRED_ENV_VARS.PRIVY_APP_SECRET) {
  throw new Error("PRIVY_APP_ID and PRIVY_APP_SECRET are required");
}

export const privy = new PrivyClient(
  REQUIRED_ENV_VARS.PRIVY_APP_ID,
  REQUIRED_ENV_VARS.PRIVY_APP_SECRET
);
