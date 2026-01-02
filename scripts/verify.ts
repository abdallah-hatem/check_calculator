import { calculateSplits, calculateSettlements, BillDetails, Participant } from '../utils/calculator';
import assert from 'assert';

console.log('Running verification...');

// Scenario 1: Simple Even Split
// Bill: $100 Order + $10 Del + $10 Tax = $120 Total
// 2 People: A ($50), B ($50).
// A Paid $120. B Paid $0.
// Split: Del ($5 each), Tax ($5 each). Total Due: $60 each.
// Net: A (+$60), B (-$60).
// Settlement: B pays A $60.

const bill1: BillDetails = { delivery: 10, tax: 10, service: 0 };
const parts1: Participant[] = [
    { id: '1', name: 'Alice', orderedAmount: 50, paidAmount: 120 },
    { id: '2', name: 'Bob', orderedAmount: 50, paidAmount: 0 }
];

const results1 = calculateSplits(parts1, bill1);
const settlements1 = calculateSettlements(results1);

// Checks
const alice = results1.find(p => p.name === 'Alice')!;
const bob = results1.find(p => p.name === 'Bob')!;

console.log('Scenario 1 Results:', { alice: alice.netBalance, bob: bob.netBalance });
console.log('Scenario 1 Settlements:', settlements1);

assert(Math.abs(alice.totalOwed - 60) < 0.01, 'Alice Total Owed wrong');
assert(Math.abs(bob.totalOwed - 60) < 0.01, 'Bob Total Owed wrong');
assert(Math.abs(alice.netBalance - 60) < 0.01, 'Alice Net wrong');
assert(Math.abs(bob.netBalance + 60) < 0.01, 'Bob Net wrong');
assert(settlements1.length === 1, 'Should require 1 settlement');
assert(settlements1[0].from === 'Bob' && settlements1[0].to === 'Alice' && settlements1[0].amount === 60, 'Settlement details wrong');

// Scenario 2: Uneven Split
// Bill: $100 Order ($80 Alice, $20 Bob).
// Tax: $10 (10%). Service: $10 (10%). Delivery: $10.
// Total Fees: $30. Total Bill: $130.
// Ratios: Alice (0.8), Bob (0.2).
// Tax Split: Alice $8, Bob $2.
// Service Split: Alice $8, Bob $2.
// Delivery Split: Alice $5, Bob $5 (Equal).
// Total Due Alice: 80 + 8 + 8 + 5 = 101.
// Total Due Bob: 20 + 2 + 2 + 5 = 29.
// Check Sum: 101 + 29 = 130. Correct.

const bill2: BillDetails = { delivery: 10, tax: 10, service: 10 };
const parts2: Participant[] = [
    { id: '1', name: 'Alice', orderedAmount: 80, paidAmount: 130 },
    { id: '2', name: 'Bob', orderedAmount: 20, paidAmount: 0 }
];

const results2 = calculateSplits(parts2, bill2);

const alice2 = results2.find(p => p.name === 'Alice')!;
const bob2 = results2.find(p => p.name === 'Bob')!;

console.log('Scenario 2 Results:', { alice: alice2.totalOwed, bob: bob2.totalOwed });

assert(Math.abs(alice2.totalOwed - 101) < 0.01, 'Alice Total Owed S2 wrong');
assert(Math.abs(bob2.totalOwed - 29) < 0.01, 'Bob Total Owed S2 wrong');

console.log('ALL TESTS PASSED ✅');
