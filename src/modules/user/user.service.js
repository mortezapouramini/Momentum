const appError = require("../../utils/error.util");
const {
  getUserById,
  updateUserById,
  findUserByUserName,
} = require("./user.repository");
const argon2 = require("argon2");

const getUserService = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw appError({ code: 404, message: "User not found" });
  }
  return user;
};

const updateUserService = async (userId, userData) => {
  if (Object.keys(userData).length === 0) {
    throw appError({ code: 400, message: "No fields to update" });
  }
  const user = await getUserById(userId);
  if (!user) {
    throw appError({ code: 401, message: "User not found" });
  }
  if (userData.userName) {
    const existUserName = await findUserByUserName(userData.userName);
    if (existUserName) {
      throw appError({ code: 409, message: "userName is exists" });
    }
  }

  if (userData.password && userData.oldPassword) {
    const hashedOldPassword = await user.password_hash;
    const isMatchPassword = await argon2.verify(
      hashedOldPassword,
      userData.oldPassword,
    );
    if (!isMatchPassword) {
      throw appError({ code: 401, message: "Invalid credentials" });
    }
    const hashedNewPassword = await argon2.hash(userData.password);
    userData.password = hashedNewPassword;
    delete userData.oldPassword;
  }

  const updatedUser = await updateUserById(userId, userData);

  if (!updatedUser) {
    throw appError({ code: 404, message: "User not found" });
  }
  return updatedUser;
};

module.exports = { getUserService, updateUserService };
