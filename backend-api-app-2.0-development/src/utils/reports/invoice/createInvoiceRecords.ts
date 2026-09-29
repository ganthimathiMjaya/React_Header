import moment from 'moment';

export function createInvoiceRecord(job: any) {
  const invoiceNo = job.poNum ? job.poNum : _createInvoiceNo(job);
  let invoiceLineNo = 1;
  const jobId = job.id;
  const details = [];
  const amount = job.clientPay || '0.0';
  const qbClass = '';
  const quantity = 1;
  const qbRef = '';
  const description = job.invoiceNotes || '';

  details.push({
    invoiceLineNo,
    amount,
    qbClass,
    quantity,
    qbRef,
    description,
  });

  if (job.jobDuration && job.jobDuration > job.maxDuration) {
    invoiceLineNo += 1;
    const rentOverageQuantity =
      Number(job.jobDuration) - Number(job.maxDuration);
    details.push({
      invoiceLineNo,
      qbClass,
      quantity: rentOverageQuantity,
      qbRef,
      description: 'Rent Overage',
    });
  }
  if (job.tonnage && job.tonnage > job.maxTonnage) {
    invoiceLineNo += 1;
    const tonnageOverageQuantity = Number(job.tonnage) - Number(job.maxTonnage);
    details.push({
      invoiceLineNo,
      qbClass,
      quantity: tonnageOverageQuantity,
      qbRef,
      description: 'Tonnage Overage',
    });
  }

  return {
    invoiceNo,
    jobId,
    details,
  };
}

export function _createInvoiceNo(job: any) {
  const customerInitialsArr = job.customer.name.split(' ');
  const customerInitials = `${customerInitialsArr[0][0].toUpperCase()}${customerInitialsArr[1][0].toUpperCase()}`;
  const dateString = moment(job.scheduledDate).format('MMDD');
  return `${customerInitials}${dateString}${job.techReference.slice(-4)}`;
}

export function createInvoiceNumber(job: any) {
  const customerInitialsArr = job.customer.name.split(' ');
  const customerInitials = `${customerInitialsArr[0][0].toUpperCase()}${
    customerInitialsArr[1] ? customerInitialsArr[1][0].toUpperCase() : ''
  }`;
  const dateString = moment(new Date()).format('YYMMDDhhssSSS');
  return `${customerInitials}${job.techReference
    .slice(-4)
    .toUpperCase()}${dateString}`;
}

export function createInvoiceNumberFromInvoice(invoice: any) {
  const customerInitialsArr = invoice.customer?.name?.split(' ');
  const customerInitials = `${customerInitialsArr[0][0].toUpperCase()}${
    customerInitialsArr[1] ? customerInitialsArr[1][0].toUpperCase() : ''
  }`;
  const dateString = moment(new Date()).format('YYMMDDhhssSSS');
  return `${customerInitials}${dateString}`;
}

export function createInvoiceNumberFromName(customerName: string | undefined) {
  const customerInitialsArr = customerName?.split(' ') || '';
  const customerInitials = `${customerInitialsArr[0][0].toUpperCase()}${
    customerInitialsArr[1] ? customerInitialsArr[1][0].toUpperCase() : ''
  }`;
  const dateString = moment(new Date()).format('YYMMDDhhssSSS');
  return `${customerInitials}${dateString}`;
}
