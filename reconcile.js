// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

const transactions = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n");

for (const line of lines) {
  if (!line.trim()) continue;

  try {
    const event = JSON.parse(line);
    if (!event.txn_id) continue;

    const existing = transactions.get(event.txn_id);
    if (!existing || event.ts > existing.ts) {
      transactions.set(event.txn_id, event);
    }
  } catch {
    continue;
  }
}

let total = 0;
let count = 0;

for (const event of transactions.values()) {
  if (event.status === "success") {
    const amount = typeof event.amount === "string" ? event.amount.replace(/,/g, "") : event.amount;
    total += Number(amount);
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
