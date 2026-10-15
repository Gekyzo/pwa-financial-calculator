// Savings with an initial amount and a contribution at the end of each month, compounded
// monthly. `rate` is the annual nominal rate in percent. Each row of `years` holds what was put
// in up to the end of that year, the interest of that year and the balance at its end.
export const savings = ({ initial, monthly, rate, years }) => {
  const months = Math.round(years * 12);
  const i = rate / 100 / 12;
  const byYear = [];
  let balance = initial;
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * i;
    balance += interest + monthly;
    const year = Math.ceil(month / 12);
    const row = byYear[year - 1] ?? (byYear[year - 1] = { year, contributed: 0, interest: 0, balance });
    row.contributed = initial + monthly * month;
    row.interest += interest;
    row.balance = balance;
  }
  const contributed = initial + monthly * months;
  return { final: balance, contributed, interest: balance - contributed, years: byYear };
};
