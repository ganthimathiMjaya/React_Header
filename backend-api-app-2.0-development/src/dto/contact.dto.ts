export class ContactDto {
  active?: boolean;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  ownerId?: number;
  customerId?: string;
  contactTypeId: number | undefined;
}
