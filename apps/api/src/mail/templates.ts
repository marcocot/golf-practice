export interface ActionEmailInput {
  subject: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderActionEmail(input: ActionEmailInput): RenderedEmail {
  const text = `${input.heading}\n\n${input.body}\n\n${input.actionLabel}: ${input.actionUrl}`;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="background:#16a34a;padding:20px 28px;">
                <span style="font-size:18px;font-weight:700;color:#ffffff;">⛳ Golf Practice</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(input.heading)}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#3f3f46;">${escapeHtml(input.body)}</p>
                <a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 22px;border-radius:10px;">${escapeHtml(input.actionLabel)}</a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#71717a;">If the button doesn't work, paste this link into your browser:<br /><span style="color:#3f3f46;word-break:break-all;">${escapeHtml(input.actionUrl)}</span></p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">You're getting this because someone used this address on Golf Practice.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: input.subject, text, html };
}
