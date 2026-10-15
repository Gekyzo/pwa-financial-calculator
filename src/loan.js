import { round2 } from '#number';

// A loan or a mortgage with a fixed monthly payment (French amortisation). `rate` is the annual
// nominal rate in percent. The schedule is in cents: each month pays the interest of the balance
// and the rest of the payment goes to the principal; the last month pays what is left, so the
// balance closes at 0.
export const loan = ({ amount, rate, years }) => {
  const months = Math.round(years * 12);
  const i = rate / 100 / 12;
  const payment = round2(i === 0 ? amount / months : (amount * i) / (1 - (1 + i) ** -months));
  const byYear = [];
  let balance = amount;
  let totalInterest = 0;
  for (let month = 1; month <= months; month += 1) {
    const interest = round2(balance * i);
    const principal = month === months ? balance : Math.min(round2(payment - interest), balance);
    balance = round2(balance - principal);
    totalInterest = round2(totalInterest + interest);
    const year = Math.ceil(month / 12);
    const row = byYear[year - 1] ?? (byYear[year - 1] = { year, principal: 0, interest: 0, balance });
    row.principal = round2(row.principal + principal);
    row.interest = round2(row.interest + interest);
    row.balance = balance;
  }
  return { payment, months, totalInterest, totalPaid: round2(amount + totalInterest), years: byYear };
};
