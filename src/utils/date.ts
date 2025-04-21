export const fifteenMinutesFromNow = () =>
  new Date(Date.now() + 15 * 60 * 1000);

export const sevenDaysFromNow = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const tenMinutesAgo = () => new Date(Date.now() - 10 * 60 * 1000);

export const convertToMs = (date: Date) => date.getTime();
