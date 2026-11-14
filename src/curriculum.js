// VERIFY every figure against Scotiabank + CRA before demo day.
export const TOPICS = [
    {
    id: "tax-advantaged",
    title: "Tax-Advantaged Savings Accounts",
    cta: { label: "Open a TFSA", url: "/open-account/tfsa" },
    factSheet: `A regular high-interest savings account earns interest that is taxable. A TFSA (Tax-Free Savings Account) lets Canadians 18+ grow money tax-free; withdrawals are not taxed, unused room carries forward, and over-contributing triggers a penalty tax. A TFSA is an account, not an investment: it can hold cash, GICs, ETFs and stocks. An RRSP is for retirement: contributions are tax-deductible and withdrawals are taxed. An FHSA (First Home Savings Account) helps first-time buyers save for a home, with deductible contributions and tax-free qualifying withdrawals. VERIFY all contribution limits against CRA before demo day.`,
  },
  {
    id: "chequing",
    title: "Chequing Accounts",
    cta: { label: "Open a Chequing Account", url: "/open-account/chequing" },
    factSheet: `A chequing account is for everyday spending: debit purchases, bill payments, e-transfers, and receiving paycheques. It usually pays little or no interest. Many have monthly fees, which can sometimes be waived with a minimum balance or student status. Watch for overdraft charges and transaction limits.`,
  },
  {
    id: "savings",
    title: "Savings Accounts",
    cta: { label: "Open a Savings Account", url: "/open-account/savings" },
    factSheet: `A savings account is for money you don't need day-to-day. It earns interest, typically higher than chequing. It's good for emergency funds and short-term goals. Interest is generally taxable. Having savings separate from chequing reduces the temptation to spend.`,
  },
  {
    id: "tfsa",
    title: "TFSA",
    cta: { label: "Open a TFSA", url: "/open-account/tfsa" },
    factSheet: `A Tax-Free Savings Account (TFSA) lets Canadians 18+ grow money tax-free: interest, dividends, and gains are not taxed, and withdrawals are not taxed. Annual contribution room is set by the government (VERIFY CURRENT YEAR LIMIT). Unused room carries forward. Withdrawn amounts are added back to room the following calendar year. Over-contributing triggers a penalty tax. A TFSA is an account type, not an investment: it can hold cash, GICs, mutual funds, ETFs, and stocks.`,
  },
  {
    id: "investing",
    title: "Investment Accounts",
    cta: { label: "Open an Investment Account", url: "/open-account/investing" },
    factSheet: `An investment account holds assets like stocks, bonds, ETFs, and mutual funds that can grow over time but can also lose value. Higher potential returns come with higher risk. Diversification spreads risk across many assets. Time horizon matters: longer horizons can generally tolerate more volatility. Fees (like MERs) reduce returns over time.`,
  },
];

// Rotates one topic per day. For demo, override with ?topic=tfsa
export function topicForToday(override) {
  if (override) return TOPICS.find(t => t.id === override) ?? TOPICS[0];
  const day = Math.floor(Date.now() / 86_400_000);
  return TOPICS[day % TOPICS.length];
}