import { renderActionEmail } from '@/mail/templates';

describe('renderActionEmail', () => {
  const rendered = renderActionEmail({
    subject: 'Verify your email',
    heading: 'Confirm your email',
    body: 'Tap the button below.',
    actionLabel: 'Verify email',
    actionUrl: 'https://app.example.com/verify?token=abc&x=1',
  });

  it('keeps the subject and puts the link in the plain-text part', () => {
    expect(rendered.subject).toBe('Verify your email');
    expect(rendered.text).toContain('https://app.example.com/verify?token=abc&x=1');
    expect(rendered.text).toContain('Confirm your email');
  });

  it('renders an HTML button pointing at the action URL', () => {
    expect(rendered.html).toContain('Verify email');
    expect(rendered.html).toContain('href="https://app.example.com/verify?token=abc&amp;x=1"');
  });

  it('escapes HTML in the provided content', () => {
    const result = renderActionEmail({
      subject: 's',
      heading: '<script>',
      body: 'b',
      actionLabel: 'go',
      actionUrl: 'https://x.test',
    });
    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;');
  });
});
