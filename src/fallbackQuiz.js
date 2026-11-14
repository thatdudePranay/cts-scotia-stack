// Used automatically if the Claude call fails (stage Wi-Fi insurance).
export const FALLBACK_QUESTIONS = [
  { id: "q1", type: "mc", question: "What is a TFSA?",
    options: ["A type of stock", "An account where growth is tax-free", "A loan", "A credit card"],
    answer_index: 1, why: "A TFSA is an account type that shelters growth from tax." },
  { id: "q2", type: "free", question: "In your own words, why might someone use a TFSA instead of a regular savings account?",
    rubric: ["growth/interest is tax-free", "withdrawals are tax-free", "can hold investments, not just cash"] },
  { id: "q3", type: "mc", question: "What happens to unused TFSA contribution room?",
    options: ["It disappears", "It carries forward", "It goes to the bank", "It's refunded"],
    answer_index: 1, why: "Unused room carries forward to future years." },
  { id: "q4", type: "free", question: "What could happen if you contribute more than your TFSA room?",
    rubric: ["penalty tax applies", "over-contribution is charged"] },
  { id: "q5", type: "free", question: "Is a TFSA an investment itself? Explain.",
    rubric: ["it's an account, not an investment", "can hold stocks, ETFs, GICs, cash"] },
];
