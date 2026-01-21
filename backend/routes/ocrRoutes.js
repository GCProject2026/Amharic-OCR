const router = require("express").Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "ocr" });
});

module.exports = router;
