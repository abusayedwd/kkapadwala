import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import jwt from 'jsonwebtoken';

const verifyCallback =
  (req: import('express').Request, resolve: () => void, reject: (e: unknown) => void, requiredRights: string[]) =>
  async (err: unknown, user: { role: string; id?: string } | false, info: unknown) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized'));
    }
    (req as import('express').Request & { user: typeof user }).user = user;

    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
      const token = authorization.split(' ')[1];
      jwt.decode(token);
    }

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) as string[];
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
