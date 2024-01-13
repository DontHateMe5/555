"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrpl_1 = require("xrpl");
const client = new xrpl_1.Client('wss://s.altnet.rippletest.net:51233');
// This snippet walks us through partial payment.
function partialPayment() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        // creating wallets as prerequisite
        const { wallet: wallet1 } = yield client.fundWallet();
        const { wallet: wallet2 } = yield client.fundWallet();
        // create a trustline to issue an IOU `FOO` and set limit on it.
        const trust_set_tx = {
            TransactionType: 'TrustSet',
            Account: wallet2.classicAddress,
            LimitAmount: {
                currency: 'FOO',
                issuer: wallet1.classicAddress,
                // Value for the new IOU - 10000000000 - is arbitarily chosen.
                value: '10000000000',
            },
        };
        console.log("Submitting a TrustSet transaction...");
        const trust_set_res = yield client.submitAndWait(trust_set_tx, {
            wallet: wallet2,
        });
        console.log("TrustSet transaction response:");
        console.log(trust_set_res);
        console.log('Balances after trustline is created');
        console.log(`Balance of ${wallet1.classicAddress} is ${yield client.getBalances(wallet1.classicAddress)}`);
        console.log(`Balance of ${wallet2.classicAddress} is ${yield client.getBalances(wallet2.classicAddress)}`);
        // Initially, the issuer(wallet1) sends an amount to the other account(wallet2)
        const issue_quantity = '0.017469';
        const payment = {
            TransactionType: 'Payment',
            Account: wallet1.classicAddress,
            Amount: {
                currency: 'FOO',
                value: issue_quantity,
                issuer: wallet1.classicAddress,
            },
            Destination: wallet2.classicAddress,
        };
        // submit payment
        const initialPayment = yield client.submitAndWait(payment, {
            wallet: wallet1,
        });
        console.log("Initial payment response:", initialPayment);
        console.log('Balances after issuer(wallet1) sends IOU("FOO") to wallet2');
        console.log(`Balance of ${wallet1.classicAddress} is ${yield client.getBalances(wallet1.classicAddress)}`);
        console.log(`Balance of ${wallet2.classicAddress} is ${yield client.getBalances(wallet2.classicAddress)}`);
        /*
         * Send money less than the amount specified on 2 conditions:
         * 1. Sender has less money than the aamount specified in the payment Tx.
         * 2. Sender has the tfPartialPayment flag activated.
         *
         * Other ways to specify flags are by using Hex code and decimal code.
         * eg. For partial payment(tfPartialPayment)
         * decimal ->131072, hex -> 0x00020000
         */
        const partialPaymentTx = {
            TransactionType: 'Payment',
            Account: wallet2.classicAddress,
            Amount: {
                currency: 'FOO',
                value: '15977',
                issuer: wallet1.classicAddress,
            },
            Destination: wallet1.classicAddress,
            Flags: xrpl_1.PaymentFlags.tfPartialPayment,
        };
        // submit payment
        console.log("Submitting a Partial Payment transaction...");
        const submitResponse = yield client.submitAndWait(partialPaymentTx, {
            wallet: wallet2,
        });
        console.log("Partial Payment response: ", submitResponse);
        console.log("Balances after Partial Payment, when wallet2 tried to send 15977 FOO's");
        console.log(`Balance of ${wallet1.classicAddress} is ${yield client.getBalances(wallet1.classicAddress)}`);
        console.log(`Balance of ${wallet2.classicAddress} is ${yield client.getBalances(wallet2.classicAddress)}`);
        yield client.disconnect();
    });
}
void partialPayment();
