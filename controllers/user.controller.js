const userService = require("../services/user.service");
const { userValidation } = require("../helpers/validation");
const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;

const register = async (req, res, next) => {
  const { error } = userValidation.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Email: 3 or more characters. Password: min. 8 characters.",
    });
  }

  try {
    const { email } = req.body;
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Provided email already exists",
      });
    }

    const newUser = await userService.createUser(req.body);

    const responseData = {
      _id: newUser._id,
      email: newUser.email,
    };

    res.status(201).json({
      status: "success",
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.loginUser(email, password);

  if (!user) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "User not found",
      data: "Bad request",
    });
  }

  const payload = {
    id: user._id,
  };

  const accessToken = jwt.sign(payload, process.env.SECRET, {
    expiresIn: "1h",
  });

  user.token = accessToken;
  await user.save();

  res.json({
    status: "success",
    code: 200,
    data: {
      accessToken,

      sid: user._id,
      userData: {
        email: user.email,
        balance: user.balance,
        id: user._id,
        transactions: user.transactions,
      },
    },
  });
};

const logout = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Email is required",
        data: "Bad request",
      });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
        data: "Not found",
      });
    }

    user.token = null;
    await user.save();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
      data: "Internal Server Error",
    });
  }
};

const updateUserBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { newBalance } = req.body;

    if (!newBalance || isNaN(newBalance)) {
      return res.status(400).json({ error: "Invalid new balance" });
    }

    const updatedBalance = await userService.updateUserBalance(
      userId,
      newBalance
    );
    res.status(200).json({ newBalance: updatedBalance });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ error: "User not found" });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  updateUserBalance,
};
