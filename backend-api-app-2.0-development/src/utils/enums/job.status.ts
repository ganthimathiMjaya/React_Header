enum JobStatus {
  Unassigned = 1,
  Scheduled = 2,
  InProgress = 3,
  Complete = 4,
  // 'Ticket Sent' = 5, //DEPRECATED
  // Reported = 6, //DEPRECATED
  // Incomplete = 7, //DEPRECATED
  // Late = 8, //DEPRECATED
  NeedsApproval = 9,
  Cancelled = 10,
  // Available = 11, //DEPRECATED
  // Unavailable = 12, //DEPRECATED
  // 'Details Sent' = 13, //DEPRECATED
  Invoiced = 14,
}

export enum InvoicingQueueStatus {
  'Ready' = 'Ready',
  'MissingInfo' = 'Missing Info',
}

export default JobStatus;
