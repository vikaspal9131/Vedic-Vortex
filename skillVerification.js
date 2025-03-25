const express = require("express");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const xrpl = require("xrpl");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const SkillSchema = new mongoose.Schema({
  userId: String,
  skill: String,
  issuedBy: String,
  walletAddress: String,
  qrCode: String,
});
const Skill = mongoose.model("Skill", SkillSchema);

// Generate Skill Credential & QR Code
app.post("/generate-skill", async (req, res) => {
  const { userId, skill, issuedBy, walletAddress } = req.body;
  const token = jwt.sign({ userId, skill }, process.env.JWT_SECRET, { expiresIn: "1y" });

  const qrCodeUrl = await QRCode.toDataURL(token);
  const newSkill = new Skill({ userId, skill, issuedBy, walletAddress, qrCode: qrCodeUrl });
  await newSkill.save();

  res.json({ message: "Skill verified!", qrCode: qrCodeUrl });
});

// Verify Skill via QR Code
app.post("/verify-skill", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    res.json({ message: "Skill verified!", data: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid skill QR Code" });
  }
});

// XRPL Wallet Lookup
app.get("/wallet-lookup/:wallet", async (req, res) => {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  const accountInfo = await client.request({ command: "account_info", account: req.params.wallet });
  client.disconnect();

  res.json({ message: "Wallet found!", data: accountInfo });
});

app.listen(5001, () => console.log("Skill Verification API running on port 5001"));
