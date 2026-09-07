const responder = require("../../utils/responder");
const userService = require("./user.service");

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserService(req.params.userId);
    responder({ res, data: user, code: 200, message: "UserData recived" });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUserService(req.params.userId, req.body);
    responder({ res, data: user, code: 200, message: "UserData updated" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUser, updateUser };
