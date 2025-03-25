const express = require("express");
const Web3 = require("web3");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const web3 = new Web3(process.env.ETH_NODE_URL);
const contractABI = [/* ABI from compiled SkillFiToken.sol */];
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Reward User with SkillFi Tokens
app.post("/reward", async (req, res) => {
  const { user, amount } = req.body;
  const tx = await contract.methods.rewardUser(user, amount).send({ from: process.env.OWNER_WALLET });
  res.json({ message: "Tokens sent!", tx });
});

app.listen(5003, () => console.log("SkillFi Token API running on port 5003"));
