import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import response from '../config/response';
import { authService, userService, tokenService, emailService } from '../services';

const register = catchAsync(async (req, res) => {
  const isUser = await userService.getUserByEmail(req.body.email);

  if (isUser && isUser.isEmailVerified === false) {
    const user = await userService.isUpdateUser(String(isUser.id), req.body);
    const tokens = await tokenService.generateAuthTokens(user as { id: string });
    res.status(httpStatus.CREATED).json(
      response({
        message: 'Thank you for registering. Please verify your email',
        status: 'OK',
        statusCode: httpStatus.CREATED,
        data: {},
      } as Record<string, unknown>)
    );
  } else if (isUser && isUser.isDeleted === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  } else if (isUser && isUser.isDeleted === true) {
    const user = await userService.isUpdateUser(String(isUser.id), req.body);
    const tokens = await tokenService.generateAuthTokens(user as { id: string });
    res.status(httpStatus.CREATED).json(
      response({
        message: 'Thank you for registering. Please verify your email',
        status: 'OK',
        statusCode: httpStatus.CREATED,
        data: {},
      } as Record<string, unknown>)
    );
  } else {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user as { id: string });

    res.status(httpStatus.CREATED).json(
      response({
        message: 'Thank you for registering. Please verify your email',
        status: 'OK',
        statusCode: httpStatus.CREATED,
        data: {},
      } as Record<string, unknown>)
    );
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const isUser = await userService.getUserByEmail(email);
  if (isUser?.isDeleted === true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This Account is Deleted');
  }
  if (isUser?.isEmailVerified === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not verified');
  }
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  setTimeout(async () => {
    try {
      user.oneTimeCode = null;
      user.isResetPassword = false;
      await user.save();
      console.log('oneTimeCode reset to null after 3 minute');
    } catch (error) {
      ApiError;
      console.error('Error updating oneTimeCode:', error);
    }
  }, 180000);

  const tokens = await tokenService.generateAuthTokens(user as { id: string });
  res.status(httpStatus.OK).json(
    response({
      message: 'Login Successful',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { user, tokens },
    } as Record<string, unknown>)
  );
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).json(
    response({
      message: 'Logout Successful',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).json(
    response({
      message: 'Token Refreshed',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { tokens },
    } as Record<string, unknown>)
  );
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No users found with this email');
  }
  const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  (user as { oneTimeCode: number }).oneTimeCode = oneTimeCode;
  user.isResetPassword = true;
  await user.save();

  await emailService.sendResetPasswordEmail(req.body.email, oneTimeCode);
  res.status(httpStatus.OK).json(
    response({
      message: 'Email Sent',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.password, req.body.email);
  res.status(httpStatus.OK).json(
    response({
      message: 'Password Reset Successful',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user as { email: string }, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: 'Password Change Successful',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

const sendVerificationEmail = catchAsync(async (req, res) => {});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.body, req.query);

  const tokens = await tokenService.generateAuthTokens(user as { id: string });

  res.status(httpStatus.OK).json(
    response({
      message: 'Email Verified',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { user, tokens },
    } as Record<string, unknown>)
  );
});

const deleteMe = catchAsync(async (req, res) => {
  const user = await authService.deleteMe(req.body.password, req.user as { email: string });
  res.status(httpStatus.OK).json(
    response({
      message: 'Account Deleted',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { user },
    } as Record<string, unknown>)
  );
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  deleteMe,
  changePassword,
};
