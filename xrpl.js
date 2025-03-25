const xrpl = require("xrpl");
const dotenv = require("dotenv");
dotenv.config();

const walletSecret = process.env.XRPL_WALLET_SECRET;
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233"); // Testnet

async function connect() {
  await client.connect();
  console.log("Connected to XRPL");
}

async function getWallet() {
  const wallet = xrpl.Wallet.fromSeed(walletSecret);
  console.log("Wallet Address:", wallet.classicAddress);
  return wallet;
}

// Mint an NFT for user credentials
async function mintNFT(destinationAddress, uri) {
  const wallet = await getWallet();
  const transaction = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex(uri), // Link to stored credentials (IPFS/Database)
    Flags: 8, // Transferable NFT
    NFTokenTaxon: 0, // Required field (Arbitrary)
  };

  const tx = await client.submitAndWait(transaction, { wallet });
  console.log("NFT Minted:", tx.result.meta);
}

// Transfer NFT (Credential) to user
async function transferNFT(nftId, userAddress) {
  const wallet = await getWallet();
  const transaction = {
    TransactionType: "NFTokenCreateOffer",
    Account: wallet.classicAddress,
    NFTokenID: nftId,
    Amount: "0", // Free transfer
    Destination: userAddress,
    Flags: 1, // Sell offer
  };

  const tx = await client.submitAndWait(transaction, { wallet });
  console.log("NFT Transferred:", tx.result.meta);
}

// Handle XRPL payments (e.g., course purchase)
async function sendPayment(destination, amount) {
  const wallet = await getWallet();
  const transaction = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Destination: destination,
    Amount: xrpl.xrpToDrops(amount), // Convert XRP to drops
  };

  const tx = await client.submitAndWait(transaction, { wallet });
  console.log("Payment Sent:", tx.result.meta);
}

async function main() {
  await connect();
  await mintNFT("rUserAddressHere", "https://example.com/certificate.json");
  await sendPayment("rRecipientAddressHere", 10); // Send 10 XRP
}

main();
