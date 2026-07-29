import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
const { successHandler: morganSuccessHandler, errorHandler: morganErrorHandler } = morgan;
import { jwtStrategy } from './config/passport';
import { authLimiter } from './middlewares/rateLimiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';

const app = express();

if (config.env !== 'test') {
  app.use(morganSuccessHandler);
  app.use(morganErrorHandler);
}

app.use(express.static('public'));

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(xss());
app.use(mongoSanitize());

app.use(compression());

app.use(cors());
app.options('*', cors());

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1', authLimiter);
}

app.use('/v1', routes);

app.get('/test', (req, res) => {
  const userIP =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;
  res.send({ message: 'This is Initial API', userIP });
});

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'This API Not found'));
});

app.use(errorConverter);

app.use(errorHandler);

export default app;
