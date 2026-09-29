const randomString = (length: number) => {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return chars
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
    .slice(0, length);
};

export default randomString;
