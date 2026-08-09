const mongoose = require("mongoose");
const { env } = require("./env");

mongoose.set("strictQuery", true);

async function connectDatabase(uri = env.mongoDbUri) {
  if (!uri) {
    return null;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  return mongoose.connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
