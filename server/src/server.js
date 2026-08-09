require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/database");
const { env, validateProductionEnv } = require("./config/env");

async function startServer() {
  validateProductionEnv(env);

  if (!env.mongoDbUri) {
    console.warn("MONGODB_URI is not configured; database-backed routes are unavailable.");
  } else {
    await connectDatabase(env.mongoDbUri);
    console.log("Connected to MongoDB.");
  }

  app.listen(env.port, () => {
    console.log(`CivicFix API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start CivicFix API.");
  console.error(error.message);
  process.exit(1);
});
