/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import tokenService from './token.service';
import userService from './user.service';
import Token from '../models/token.model';
import ApiError from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';

const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await userService?.getUserByEmail(email);
  if (!user || !(await (user as any).isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.deleteOne();
};

const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(String(refreshTokenDoc.user));
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user as { id: string });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const resetPassword = async (newPassword: string, email: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (await (user as any).isPasswordMatch(newPassword)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password cannot be the same as old password');
  }
  await userService.updateUserById(String(user.id), { password: newPassword });

  return user;
};

const changePassword = async (reqUser: { email: string }, reqBody: { oldPassword: string; newPassword: string }) => {
  const { oldPassword, newPassword } = reqBody;
  const user = await userService.getUserByEmail(reqUser.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await (user as any).isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect password');
  }
  if (await (user as any).isPasswordMatch(newPassword)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password cannot be the same as old password');
  }
  user.password = newPassword;
  await user.save();
  return user;
};

const verifyEmail = async (reqBody: { email: string; oneTimeCode: string }, reqQuery: Record<string, unknown>) => {
  const { email, oneTimeCode } = reqBody;
  console.log('reqBody', email);
  console.log('reqQuery', oneTimeCode);
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  } else if (user.oneTimeCode === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  } else if (oneTimeCode != user.oneTimeCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  } else if (user.isEmailVerified && !user.isResetPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already verified');
  } else {
    user.isEmailVerified = true;
    user.oneTimeCode = null;
    user.isResetPassword = false;
    await user.save();
    return user;
  }
};

const verifyNumber = async (phoneNumber: string, otpCode: string, email: string) => {
  console.log('reqBody', email);
  console.log('reqQuery', otpCode);
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  } else if ((user as any).phoneNumberOTP === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  } else if (otpCode != (user as any).phoneNumberOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  } else if ((user as any).isPhoneNumberVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number already verified');
  } else {
    (user as any).isPhoneNumberVerified = true;
    (user as any).phoneNumberOTP = null;
    await user.save();
    return user;
  }
};

const deleteMe = async (password: string, reqUser: { email: string }) => {
  const user = await userService.getUserByEmail(reqUser.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await (user as any).isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect password');
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  deleteMe,
  changePassword,
  verifyNumber,
};
