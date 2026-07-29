import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import response from '../config/response';
import { crewService } from '../services';
import { Service } from '../models';

const createTask = catchAsync(async (req, res) => {
  const { crewName, sessions, crewLeaders, affiliations, location, description } = req.body;

  const parsedSession = JSON.parse(sessions);
  const parsedCrewLeaders = JSON.parse(crewLeaders);
  const parsedAffiliations = JSON.parse(affiliations);

  const crewData: Record<string, unknown> = {
    crewName,
    sessions: parsedSession,
    crewLeaders: parsedCrewLeaders,
    affiliations: parsedAffiliations,
    location,
    description,
  };

  if (req.user) {
    crewData.userId = (req.user as { _id: unknown })._id;
  }

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required');
  }

  if (req.file) {
    crewData.image = {
      url: '/uploads/crews/' + req.file.filename,
      path: req.file.path,
    };
  }

  const crew = await crewService.createCrew(crewData);
  res.status(httpStatus.CREATED).json(
    response({
      message: 'Task Created Successfully',
      status: 'OK',
      statusCode: httpStatus.CREATED,
      data: crew,
    } as Record<string, unknown>)
  );
});

const getTask = catchAsync(async (req, res) => {
  const blog = await crewService.getCrewById(req.params.crewId);
  res.status(httpStatus.OK).json(
    response({
      message: 'Task',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: blog,
    } as Record<string, unknown>)
  );
});

const getTasks = catchAsync(async (req, res) => {
  const filter = pick(req.query as Record<string, string>, ['title']);
  const options = pick(req.query as Record<string, string | number>, ['sortBy', 'limit', 'page']);
  const result = await crewService.queryCrews(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: 'All Tasks',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: result,
    } as Record<string, unknown>)
  );
});

const updateTask = catchAsync(async (req, res) => {
  const { crewId } = req.params;
  const { sessions, crewLeaders, affiliations, ...crewData } = req.body;

  const parsedSessions = JSON.parse(sessions);
  const parsedCrewLeaders = JSON.parse(crewLeaders);
  const parsedAffiliations = JSON.parse(affiliations);

  const updatedCrewData = {
    ...crewData,
    sessions: parsedSessions,
    crewLeaders: parsedCrewLeaders,
    affiliations: parsedAffiliations,
  };

  const image: { url?: string; path?: string } = {};
  if (req.file) {
    image.url = '/uploads/crews/' + req.file.filename;
    image.path = req.file.path;
  }

  const updatedTask = await crewService.updateCrewById(crewId, updatedCrewData, image);

  res.status(httpStatus.OK).json(
    response({
      message: 'Task Updated Successfully',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: updatedTask,
    } as Record<string, unknown>)
  );
});

const deleteTask = catchAsync(async (req, res) => {
  const blog = await crewService.deleteCrewById(req.params.crewId);
  res.status(httpStatus.OK).json(
    response({
      message: 'Task Deleted Successfully',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: blog,
    } as Record<string, unknown>)
  );
});

const homeServiceList = catchAsync(async (req, res) => {
  const service = await Service.find();
  res.status(httpStatus.OK).json(
    response({
      message: 'All Tasks',
      status: 'OK',
      statusCode: httpStatus.OK,
      data: service,
    } as Record<string, unknown>)
  );
});

export default {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
  homeServiceList,
};
