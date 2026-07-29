/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { User } from '../models';
import ApiError from '../utils/ApiError';
import emailService from './email.service';

const createUser = async (userBody: Record<string, unknown>) => {
  if (await (User as any).isEmailTaken(userBody.email as string)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  if (userBody.role === 'user' || userBody.role === 'employee') {
    emailService.sendEmailVerification(userBody.email as string, oneTimeCode);
  }
  return User.create({ ...userBody, oneTimeCode });
};

const queryUsers = async (filter: Record<string, string>, options: Record<string, string | number>) => {
  const query: Record<string, unknown> = {};

  for (const key of Object.keys(filter)) {
    if ((key === 'fullName' || key === 'email' || key === 'username') && filter[key] !== '') {
      query[key] = { $regex: filter[key], $options: 'i' };
    } else if (filter[key] !== '') {
      query[key] = filter[key];
    }
  }

  const users = await (User as unknown as { paginate: (q: Record<string, unknown>, o: Record<string, string | number>) => Promise<unknown> }).paginate(query, options);

  return users;
};

const getUserById = async (id: string) => {
  return User.findById(id);
};

const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

const updateUserById = async (userId: string, updateBody: Record<string, unknown>, files?: unknown[]) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateBody.email && (await (User as any).isEmailTaken(updateBody.email as string, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  if (files && files.length > 0) {
    updateBody.photo = files;
  } else {
    delete updateBody.photo;
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await (user as any).remove();
  return user;
};

const isUpdateUser = async (userId: string, updateBody: Record<string, unknown>) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  if (updateBody.role === 'user' || updateBody.role === 'employee') {
    emailService.sendEmailVerification(updateBody.email as string, oneTimeCode);
  }

  Object.assign(user, updateBody, {
    isDeleted: false,
    isSuspended: false,
    isEmailVerified: false,
    isResetPassword: false,
    isPhoneNumberVerified: false,
    oneTimeCode: oneTimeCode,
  });
  await user.save();
  return user;
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  isUpdateUser,
};
