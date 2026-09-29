import crypto from 'crypto';

const generatePassword = (length: number, charset: string): string => {
  const charsetLength = charset.length;

  let password = '';

  while (length--) {
    password += charset[crypto.randomInt(charsetLength)];
  }

  return password;
};

export const generateRandomPassword = () => {
  const charset = {
    NUMBERS: '0123456789',
    LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
    UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    SYMBOLS: '!@#$%^&*',
  };
  const numbers = generatePassword(2, charset.NUMBERS);
  const lower = generatePassword(2, charset.LOWERCASE);
  const upper = generatePassword(2, charset.UPPERCASE);
  const symbol = generatePassword(2, charset.SYMBOLS);
  const random = generatePassword(
    4,
    charset.NUMBERS + charset.LOWERCASE + charset.UPPERCASE + charset.SYMBOLS
  );
  return `${numbers}${lower}${upper}${symbol}${random}`;
};

export const generateRandomUUID = () => crypto.randomUUID();
