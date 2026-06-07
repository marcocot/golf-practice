import { createTransport } from 'nodemailer';
import { sendMail } from '@/mail/mailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn().mockResolvedValue(undefined) })),
}));

const createTransportMock = jest.mocked(createTransport);

describe('sendMail', () => {
  it('sends each message through a single reused transport', async () => {
    await sendMail({ to: 'player@example.com', subject: 'Verify', text: 'link' });
    await sendMail({ to: 'other@example.com', subject: 'Reset', text: 'link2' });

    expect(createTransportMock).toHaveBeenCalledTimes(1);

    const transport = createTransportMock.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledTimes(2);
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'player@example.com', subject: 'Verify', text: 'link' })
    );
  });
});
