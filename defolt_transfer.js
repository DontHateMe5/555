// Dependencies for Node.js.
// In browsers, use a <script> tag instead.
if (typeof module !== "undefined") {
  // Use var here because const/let are block-scoped to the if statement.
  var xrpl = require('xrpl')
}

// Example credentials
const wallet = xrpl.Wallet.fromSeed("sEdTvEbTDTMoGLKqY4RZtghpETA2vzj")
console.log(wallet.address) // rMFexA22eQ8GdVC2kRtbuYoqhUbJPskPU9

// Connect -------------------------------------------------------------------
async function main() {
  console.log("Connecting to Testnet...")
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233')
  await client.connect()


  // Prepare transaction -------------------------------------------------------
  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet.address,
    "Amount": xrpl.xrpToDrops("123"),
    "Destination": "rLf1b8mDDZcYgWEtpDYz7XW5GqkM4cC8D"
  })
  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", max_ledger)

  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(prepared)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)

  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob)

  // Wait for validation -------------------------------------------------------
  // submitAndWait() handles this automatically, but it can take 4-7s.

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult)
  console.log("Balance changes:", JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))

  // End of main()
  client.disconnect()
}

main()