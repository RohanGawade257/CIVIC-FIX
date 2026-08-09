const crypto = require("node:crypto");

function createStorageKey(reportId, variant) {
  return `reports/${reportId}/${variant}-${crypto.randomUUID()}.webp`;
}

module.exports = {
  createStorageKey,
};
