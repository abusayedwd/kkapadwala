import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import response from '../config/response';
import { userService } from '../services';

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: 'User Created',
      status: 'OK',
      statusCode: httpStatus.CREATED,
      data: user,
    } as Record<string, unknown>)
  );
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query as Record<string, string>, ['name', 'role', 'gender']);
  const options = pick(req.query as Record<string, string | number>, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: 'All Users',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: result,
    } as Record<string, unknown>)
  );
});

const getUser = catchAsync(async (req, res) => {
  const { id } = req.user as { id: string };
  const user = await userService.getUserById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const mySubscription = undefined;

  res.status(httpStatus.OK).json( 
    response({
      message: 'User',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { user, mySubscription },
    } as Record<string, unknown>)
  );
});

const getProfile = catchAsync(async (req, res) => {

  const { id } = req.user as { id: string };
  // console.log('User ID from token:', id);

  const user = await userService.getUserById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const mySubscription = undefined;

  res.status(httpStatus.OK).json(
    response({
      message: 'User Profile',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: { user, mySubscription },
    } as Record<string, unknown>)
  );
});


const updateUser = catchAsync(async (req, res) => {

  const { id } = req.user as { id: string };
  const image: { url?: string; path?: string } = {};
  if (req.file) {
    image.url = '/uploads/users/' + req.file.filename;
    image.path = req.file.path;
  }
  if (req.file) {
    req.body.image = image;
  }

  const user = await userService.updateUserById(id, req.body);

  res.status(httpStatus.OK).json(
    response({
      message: 'User Updated',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: user,
    } as Record<string, unknown>)
  );
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.user as { id: string };
  await userService.deleteUserById(id);
  res.status(httpStatus.OK).json(
    response({
      message: 'User Deleted',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
};
