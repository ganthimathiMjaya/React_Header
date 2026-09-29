import express from 'express';
import twilio from 'twilio';

import booking from './booking.route';
import customer from './customer.route';
import crew from './crew.route';
import image from './image.route';
import invoice from './invoice.route';
import email from './email.route';
import disposalSites from './disposalSites.route';
import dumpster from './dumpster.route';
import error from './error.route';
import feedBack from './feedBack.route';
import hyphen from './hyphen.route';
import job from './job.route';
import location from './location.route';
import notification from './notification.route';
import receiveSms from './receiveSms.route';
import report from './report.route';
import role from './role.route';
import user from './user.route';
import text from './text.route';
import servicesManagement from './servicesManagement.route';
import organizationSettings from './organizationSettings.route';
import globalSearch from './globalSearch.route';
import quickbooks from './qb.route';
import scheduledNotification from './scheduledNotification.route';

import { globalErrorHandler } from '../middlewares/globalErrorHandler';
import { orgIdCheck } from '../middlewares/orgIdCheck';
import { roleCheck } from '../middlewares/roleCheck';
import { jwtCheck } from '../middlewares/jwtCheck';
import { loadUser } from '../middlewares/loadUser';

const router = express.Router();

router.use('/receiveSms', twilio.webhook({ validate: false }), receiveSms);
router.use('/hyphen', hyphen);

// jwt check after receiveSms/hyphen to allow endpoint access without Auth0 login
router.use(jwtCheck);

// Used to validate and set the orgId (tenantId)
router.use(orgIdCheck);

// Validate and set roleId
router.use(roleCheck);

// Load user in req.user object for re-usability
router.use(loadUser);

router.use('/user', user);
router.use('/text', text);
router.use('/job', job);
router.use('/image', image);
router.use('/invoice', invoice);
router.use('/email', email);
router.use('/crew', crew);
router.use('/customer', customer);
router.use('/booking', booking);
router.use('/role', role);
router.use('/disposalSites', disposalSites);
router.use('/notification', notification);
router.use('/dumpster', dumpster);
router.use('/report', report);
router.use('/location', location);
router.use('/JobFeedback', feedBack);
router.use('/servicesManagement', servicesManagement);
router.use('/organizationSettings', organizationSettings);
router.use('/globalSearch', globalSearch);
router.use('/qb', quickbooks);
router.use('/scheduledNotification', scheduledNotification);
router.use('/', error);

router.use(globalErrorHandler);

export default router;
