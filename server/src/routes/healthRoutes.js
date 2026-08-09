const { Router } = require("express");

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "civicfix-api",
  });
});

module.exports = router;
