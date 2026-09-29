interface OrderRequest {
  header: Header;
  // items:
}

interface PurchaseOrder {
  header: {
    id: String;
    builderOrderNumber: String;
  };
}

interface Header {
  id: Number;
  builderOrderNumber: String | null;
  supplierOrderNumber: String | null;
  issueDate: String | null; // or date?
  accountNumber: String | null;
  accountCode: String | null;
  accountCode2: String | null;
  accountCode3: String | null;
  purpose: String | null;
  orderType: String | null;
  orderCurrency: String | null;
  orderLanguage: String | null;
  orderHeaderNote: String | null;
  additionalReferenceNumber: String | null;
  supplierReferenceNumber: String | null;
  buyerStatus: String | null;
  ticketId: String | null;
  warrantyRequestedStartTime: String | null;
  warrantyRequestedEndTime: String | null;
  deliveryType: String | null;
  crewId: String | null;
  storeMapNumber: String | null;
  startDate: String | null;
  endDate: String | null;
  builder: {
    id: String;
    address: Address;
    primaryContacts: Contact;
  };
  supplier: {
    id: String;
    address: Address;
    primaryContacts: Contact;
  };
  shippingInformation: {
    address: Address;
    primaryContacts: Contact;
  };
  billingInformation: {
    address: Address;
    primaryContacts: Contact;
  };
  task: Task;
  // job: Job,
  options: any[];
}

interface Address {
  name: String | null;
  street: String | null;
  streetSupplement: String | null;
  city: String | null;
  stateCode: String | null;
  postalCode: String | null;
  subdivision?: String | null;
  phase?: String | null;
  lot?: String | null;
  block?: String | null;
  plan?: String | null;
}

interface Contact {
  name: String | null;
  phone: String | null;
  email: String | null;
  eDestinationEmailAddress?: String | null;
  bidConnectEmailAddress?: String | null;
  purchasingEmailAddress?: String | null;
  purchasingCcEmailAddress?: String | null;
  accountingEmailAddress?: String | null;
  warrantyEmailAddress?: String | null;
}

interface Task {
  taskNum: String | null;
  name: String | null;
  description: String | null;
}

interface Job {
  jobNum: String | null;
  address: Address;
  elevation: String | null;
  swing: String | null;
  permitNumber: String | null;
  startDate: Date | null;
  endDate: Date | null;
  colorPackage: String | null;
  jioId: String | null;
  primaryFirstName: String | null;
  primaryLastName: String | null;
  primaryPhoneNumber: String | null;
  primaryFaxNumber: String | null;
  primaryEmailAddress: String | null;
  communityId: String | null;
  communityCode: String | null;
  communityCode2: String | null;
  communityCode3: String | null;
}

interface Item {
  builderLineItemNum: String | null;
  builderSupplierSKU: String | null;
  builderAltItemID: String | null;
  supplierSKU: String | null;
  itemDescription: String | null;
  tallySku: {};
}
// interface PurchaseOrderHeader {
//     id:
// }
