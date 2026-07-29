import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import { Tasks } from '../models';

const createTask = async (data: Record<string, unknown>) => {
  const task = await Tasks.create(data);
  return task;
};

const queryTasks = async (filter: Record<string, unknown>, options: { limit?: number | string; page?: number | string }) => {
  const { limit = 10, page = 1 } = options;

  const count = await Tasks.countDocuments(filter);

  const totalPages = Math.ceil(count / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);

  const crews = await Tasks.find(filter);

  const result = {
    data: crews,
    page: parseInt(String(page), 10),
    limit: parseInt(String(limit), 10),
    totalPages,
    totalResults: count,
  };

  if (!crews || !crews.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tasks found');
  }

  return result;
};

const getTaskById = async (id: string) => {
  const task = await Tasks.findById(id)
    .populate('crewLeaders', '_id username image')
    .populate('affiliations', '_id name');
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  }
  return task;
};

const deleteTaskById = async (id: string) => {
  const task = await Tasks.findByIdAndDelete(id);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  }
  return task;
};

const updateTaskById = async (id: string, bodyData: Record<string, unknown>, image?: unknown) => {
  const task = await getTaskById(id);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  }
  if (image) {
    (task as any).image = image;
  }

  Object.assign(task, bodyData);
  await task.save();
  return task;
};

const createCrew = createTask;
const getCrewById = getTaskById;
const queryCrews = queryTasks;
const updateCrewById = updateTaskById;
const deleteCrewById = deleteTaskById;

export default {
  createTask,
  queryTasks,
  getTaskById,
  deleteTaskById,
  updateTaskById,
  createCrew,
  getCrewById,
  queryCrews,
  updateCrewById,
  deleteCrewById,
};
