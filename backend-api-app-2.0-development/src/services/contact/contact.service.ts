import { ContactRepository } from '../../repositories/contact/contact.repository';
import { ContactDto } from '../../dto/contact.dto';

const contactRepository = new ContactRepository();

export class ContactService {

  public async getContacts(orgId: string, customerId: string){
    return await contactRepository.getContactsForCustomer(orgId, customerId);
  }

  public async createContact(orgId: string, customerId: string, body: ContactDto){
    const contact = await contactRepository.create(orgId, customerId, {
	active: body.active,
	firstName: body.firstName,
	lastName: body.lastName,
	contactTypeId: body.contactTypeId,
    }, 
    {
      address: body.email,
      default: true
    },
    {
      number: body.phone,
      default: true
    });
    return contact;
  }

  public async updateContact(orgId: string, customerId: string, contactId: string, body: ContactDto){
    return await contactRepository.update(orgId, customerId, contactId, {
	active: body.active,
	firstName: body.firstName,
	lastName: body.lastName,
	contactTypeId: body.contactTypeId,
    },
    {
      address: body.email
    },
    {
      number: body.phone
    });
  }

  public async deleteContact(orgId: string, customerId: string, contactId: string){
    return await contactRepository.delete(orgId, customerId, contactId);
  }
}
