const User = require("../models/user.model");

const createUser = async (userData) => {
  return User.create(userData);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getUserById = async (userId) => {
  return User.findById(userId);
};

const loginUser = async (email) => {
  return User.findOne({ email });
};

const logoutUser = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }
};

const updateUserBalance = async (userId, newBalance) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.balance = newBalance;
  await user.save();

  return user.balance;
};

module.exports = {
  createUser,
  getUserByEmail,
  loginUser,
  logoutUser,
  getUserById,
  updateUserBalance,
};
