function readPort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 4000;
}

function getEnv(source = process.env) {
  const nodeEnv = source.NODE_ENV || "development";

  return {
    nodeEnv,
    port: readPort(source.PORT),
    mongoDbUri: source.MONGODB_URI || "",
    authSecret: source.AUTH_SECRET || "",
    aiApiKey: source.AI_API_KEY || "",
    storageProvider: (source.STORAGE_PROVIDER || "unselected").toLowerCase(),
    storageBucket: source.STORAGE_BUCKET || "",
    storageAccessKey: source.STORAGE_ACCESS_KEY || "",
    storageSecretKey: source.STORAGE_SECRET_KEY || "",
    clientUrl: source.CLIENT_URL || (nodeEnv === "production" ? "" : "http://localhost:5173"),
  };
}

function validateProductionEnv(config = getEnv()) {
  if (config.nodeEnv !== "production") {
    return;
  }

  const missingKeys = [
    ["MONGODB_URI", config.mongoDbUri],
    [
      "AUTH_SECRET",
      config.authSecret && !config.authSecret.startsWith("replace-with") && config.authSecret.length >= 32,
    ],
    ["CLIENT_URL", config.clientUrl],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingKeys.join(", ")}`);
  }
}

module.exports = {
  env: getEnv(),
  getEnv,
  validateProductionEnv,
};
