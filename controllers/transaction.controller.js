const transactionService = require("../services/transaction.service");
const userService = require("../services/user.service");
const { getMonthlyExpenseStats } = require("../helpers/monthsExpense");
const { getMonthlyIncomeStats } = require("../helpers/monthsIncome");

const addExpense = async (req, res, next) => {
  try {
    const { description, amount, date } = req.body;
    const userId = req.user.id;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Invalid user",
      });
    }

    const { day, month, year } = date;
    const categories = "Wydatek";

    const newTransaction = await transactionService.createTransaction({
      date: { day, month, year },
      description,
      categories,
      amount,
      income: false,
      owner: userId,
    });

    user.balance -= amount;
    await user.save();

    res.status(200).json({
      newBalance: user.balance,
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

const addIncome = async (req, res, next) => {
  try {
    const { description, amount, date } = req.body;
    const userId = req.user.id;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Invalid user",
      });
    }

    const { day, month, year } = date;
    const categories = "Wydatek 2";

    const newTransaction = await transactionService.createTransaction({
      date: { day, month, year },
      description,
      categories,
      amount,
      income: true,
      owner: userId,
    });

    user.balance += amount;
    await user.save();

    res.status(200).json({
      newBalance: user.balance,
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.transactionId;

    const transaction = await transactionService.getTransactionById(
      transactionId
    );
    if (!transaction || transaction.owner.toString() !== userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid transaction" });
    }

    const user = await userService.getUserById(userId);
    const isIncome = transaction.income;
    const amount = transaction.amount;
    user.balance = isIncome ? user.balance - amount : user.balance + amount;
    await user.save();

    await transactionService.deleteTransaction(transactionId);

    res.status(200).json({ newBalance: user.balance });
  } catch (error) {
    next(error);
  }
};

const getExpenseStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const expenses = await transactionService.getExpensesByUserAndYear(
      userId,
      currentYear
    );
    const monthStats = getMonthlyExpenseStats(expenses, currentYear);

    res.status(200).json({ expenses, monthStats });
  } catch (error) {
    next(error);
  }
};

const getIncomeStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    const incomes = await transactionService.getIncomesByUserAndYear(
      userId,
      currentYear
    );
    const monthStats = getMonthlyIncomeStats(incomes, currentYear);

    res.status(200).json({ incomes, monthStats });
  } catch (error) {
    next(error);
  }
};

const getPeriodData = async (req, res, next) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    const datePattern = /^\d{4}-\d{2}$/;
    if (!datePattern.test(date)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Invalid user" });
    }

    const periodData = await transactionService.getPeriodData(userId, date);
    if (periodData.incomes.total === 0 && periodData.expenses.total === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the specified period" });
    }

    res.status(200).json(periodData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpense,
  addIncome,
  deleteTransaction,
  getExpenseStats,
  getIncomeStats,
  getPeriodData,
};
