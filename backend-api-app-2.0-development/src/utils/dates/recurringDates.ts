// Example Usage: recurringDates(new Date(), new Date('10/31/2023'), 1, 'Month', true)

export default function recurringDates(
  startDate: Date,
  endDate: Date,
  interval: number,
  intervalType: string,
  noweekends: boolean
) {
  if (intervalType === 'Month') {
    return recurringDatesMonth(startDate, endDate, interval, noweekends);
  } else if (intervalType === 'Week') {
    return recurringDatesWeek(startDate, endDate, interval, noweekends);
  }

  return [];
}

function recurringDatesMonth(
  startDate: Date,
  endDate: Date,
  interval: number,
  noweekends: boolean
) {
  let date = startDate;
  let recurrent = [];

  while (date < endDate) {
    recurrent.push(noweekends ? noWeekend() : new Date(date));
    date.setMonth(date.getMonth() + interval);
  }

  // add 1 day for sunday, subtract one for saturday
  function noWeekend() {
    let add,
      currdate = new Date(date),
      day = date.getDay();
    if (~[6, 0].indexOf(day)) {
      currdate.setDate(currdate.getDate() + (add = day == 6 ? -1 : 1));
    }
    return new Date(currdate);
  }

  return recurrent;
}

function recurringDatesWeek(
  startDate: Date,
  endDate: Date,
  interval: number,
  noweekends: boolean
) {
  let date = startDate;
  let recurrent = [];

  let i = 0;
  while (date < endDate) {
    recurrent.push(noweekends ? noWeekend() : new Date(date));
    date.setDate(date.getDate() + interval * 7);
  }

  // add 1 day for sunday, subtract one for saturday
  function noWeekend() {
    let add,
      currdate = new Date(date),
      day = date.getDay();
    if (~[6, 0].indexOf(day)) {
      currdate.setDate(currdate.getDate() + (add = day == 6 ? -1 : 1));
    }
    return new Date(currdate);
  }

  return recurrent;
}
