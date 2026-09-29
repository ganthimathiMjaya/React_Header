require('dotenv').config();

import express, { Application } from 'express';
import morgan from 'morgan';
import Router from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';
import CronJobConfigurator from './configs/cronJob.config';
import ScheduledNotificationController from './controllers/scheduledNotification/scheduledNotification.controller';
import { monthlyInsightsCronExpression } from '../app.constants';

const PORT = process.env.PORT || 4200;
const app: Application = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000', // for local development
      'https://dialexa-qa-frontend.onrender.com',
      'https://frontend-staging-iei8.onrender.com',
      'https://frontend-main-pj8p.onrender.com',
    ],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('public'));

app.use(Router);

app.disable('etag');

//Configure CRON Jobs
const cronJobConfigurator = new CronJobConfigurator();
cronJobConfigurator.configureJobs();

const schedule = new ScheduledNotificationController();
schedule.cadencedNotificationProcessor(monthlyInsightsCronExpression);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
