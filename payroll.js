const express = require("express");
const Web3 = require("web3");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const web3 = new Web3(process.env.ETH_NODE_URL);
const contractABI = [/* ABI from compiled Payroll.sol */];
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Add Employee
app.post("/add-employee", async (req, res) => {
  const { employee, salary } = req.body;
  const tx = await contract.methods.addEmployee(employee, salary).send({ from: process.env.EMPLOYER_WALLET });
  res.json({ message: "Employee added!", tx });
});

// Pay Employee Salary
app.post("/pay-salary", async (req, res) => {
  const { employee } = req.body;
  const tx = await contract.methods.paySalary(employee).send({ from: process.env.EMPLOYER_WALLET });
  res.json({ message: "Salary paid!", tx });
});

app.listen(5002, () => console.log("Payroll System API running on port 5002"));
