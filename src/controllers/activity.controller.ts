import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import response from '../config/response';

const getActivitiesById = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json(
    response({
      message: 'Activities',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

const deleteActivityById = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json(
    response({
      message: 'Activity deleted',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: {},
    } as Record<string, unknown>)
  );
});

export default {
  getActivitiesById,
  deleteActivityById,
};
