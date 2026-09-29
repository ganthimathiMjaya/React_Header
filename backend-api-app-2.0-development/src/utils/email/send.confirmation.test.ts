import { filterFakeEmails } from './send.confirmation';

describe('filterFakeEmails', () => {
  it('returns empty array if email contains auto-generated', () => {
    const input = ['auto-generated-test@test.com', 'valid@test.com'];
    const expected = ['valid@test.com'];
    const actual = filterFakeEmails(input);
    expect(actual).toEqual(expected);
  });

  it('returns empty array if email is empty string', () => {
    const input = ['', 'valid@test.com'];
    const expected = ['valid@test.com'];
    const actual = filterFakeEmails(input);
    expect(actual).toEqual(expected);
  });

  it('returns all emails if they are valid', () => {
    const input = ['valid@test.com', 'valid2@test.com'];
    const expected = ['valid@test.com', 'valid2@test.com'];
    const actual = filterFakeEmails(input);
    expect(actual).toEqual(expected);
  });

  it('returns empty array if both emails are invalid', () => {
    const input = ['auto-generated-test@test.com', ''];
    const expected: string[] = [];
    const actual = filterFakeEmails(input);
    expect(actual).toEqual(expected);
  });
});
