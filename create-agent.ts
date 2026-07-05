import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import 'dotenv/config';

// Ensure your environment variables are configured
if (!process.env.CIRCLE_API_KEY || !process.env.CIRCLE_ENTITY_SECRET) {
  console.error("❌ Missing Circle credentials in your .env file!");
  process.exit(1);
}

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

async function setupAgent() {
  try {
    console.log("⏳ Initializing Agent Wallet Set on Arc...");
    
    // 1. Create a Wallet Set (The master cryptographic context for your agent)
    const walletSetResponse = await client.createWalletSet({ 
      name: "CuraPay-Agent-Set" 
    });
    
    const setId = walletSetResponse.data?.walletSet?.id;
    if (!setId) throw new Error("Failed to retrieve Wallet Set ID");

    console.log(`✅ Wallet Set Created! ID: ${setId}`);

    // 2. Spawn a Developer-Controlled Smart Contract Wallet on Arc Testnet
    const walletResponse = await client.createWallets({
      walletSetId: setId,
      blockchains: ["ARC-TESTNET"],
      count: 1,
    });

    const agentWallet = walletResponse.data?.wallets?.[0];
    if (!agentWallet) throw new Error("Failed to deploy agent wallet instance");

    console.log("\n==================================================");
    console.log("🎉 SUCCESS: AGENT INFRASTRUCTURE PROVISIONED");
    console.log(`Wallet ID:      ${agentWallet.id}`);
    console.log(`Wallet Address: ${agentWallet.address}`);
    console.log("==================================================");
    console.log("👉 Copy the Address and fund it via the Circle Testnet Faucet before proceeding.");

  } catch (error) {
    console.error("❌ Failed to set up agent wallet infrastructure:", error);
  }
}

setupAgent();
