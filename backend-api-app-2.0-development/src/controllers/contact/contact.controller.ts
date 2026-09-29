import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../../services/contact/contact.service';

const contactService = new ContactService();

export default class ContactController {
  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await contactService.getContacts(res.locals.orgId, req.params.customerId);
      return res.status(200).json(contacts);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ContactController.getContacts',
      });
    }
  }

  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.createContact(res.locals.orgId, req.params.customerId, req.body);
      return res.status(200).json(contact);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ContactController.createContact',
      });
    }
  }

  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactService.updateContact(res.locals.orgId, req.params.customerId, req.params.contactId, req.body);
      return res.status(200).json(contact);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ContactController.updateContact',
      });
    }
  }

  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactService.deleteContact(res.locals.orgId, req.params.customerId, req.params.contactId);
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ContactController.deleteContact',
      });
    }
  }
}
