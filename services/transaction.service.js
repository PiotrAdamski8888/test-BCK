const Transaction = require("../models/transaction.model");

const createTransaction = async (transactionData) => {
  const newTransaction = new Transaction(transactionData);
  return newTransaction.save();
};

const getAllTransactions = async () => {
  return Transaction.find();
};

const deleteTransaction = async (transactionId) => {
  return Transaction.findByIdAndDelete(transactionId);
};

const getTransactionById = async (transactionId) => {
  return Transaction.findById(transactionId);
};

const getExpensesByUserAndYear = async (userId, year) => {
  return Transaction.find({
    owner: userId,
    income: false,
    "date.year": year.toString(),
  });
};

const getIncomesByUserAndYear = async (userId, year) => {
  return Transaction.find({
    owner: userId,
    income: true,
    "date.year": year.toString(),
  });
};

const getPeriodData = async (userId, date) => {
  const [year, month] = date.split("-");

  const transactions = await Transaction.find({
    owner: userId,
    "date.year": year,
    "date.month": month,
  });

  if (transactions.length === 0) {
    return {
      incomes: { total: 0, incomesData: {} },
      expenses: { total: 0, incomesData: {} },
    };
  }

  const incomes = transactions.filter((transaction) => transaction.income);
  const expenses = transactions.filter((transaction) => !transaction.income);

  const incomesData = incomes.reduce((acc, income) => {
    const { category, amount } = income;
    if (!acc[category]) {
      acc[category] = { total: 0 };
    }
    acc[category].total += amount;
    return acc;
  }, {});

  const expensesData = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) {
      acc[category] = { total: 0 };
    }
    acc[category].total += amount;
    return acc;
  }, {});

  const periodData = {
    incomes: {
      total: incomes.reduce((acc, income) => acc + income.amount, 0),
      incomesData,
    },
    expenses: {
      total: expenses.reduce((acc, expense) => acc + expense.amount, 0),
      incomesData: expensesData,
    },
  };

  return periodData;
};

module.exports = {
  createTransaction,
  getAllTransactions,
  deleteTransaction,
  getTransactionById,
  getExpensesByUserAndYear,
  getIncomesByUserAndYear,
  getPeriodData,
};
