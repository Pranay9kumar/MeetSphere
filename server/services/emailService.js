import nodemailer from 'nodemailer';

/**
 * Configure email transporter.
 * Uses environment SMTP variables if configured; otherwise creates a test/console fallback.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Development fallback transporter
  return null;
}

/**
 * Send meeting recording link and summary to user's Gmail.
 *
 * @param {Object} options
 * @param {string} options.to - Destination Gmail address
 * @param {string} options.roomName - Meeting room name or title
 * @param {string} options.fileUrl - Public or signed URL to the MP4 recording
 * @param {number} [options.duration] - Recording duration in seconds
 * @param {string} [options.recordedAt] - Recording timestamp
 */
export async function sendRecordingEmail({ to, roomName, fileUrl, duration = 0, recordedAt = new Date().toISOString() }) {
  if (!to || typeof to !== 'string') {
    throw new Error('Destination email address is required');
  }

  const durationFormatted = duration > 0 
    ? `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s` 
    : 'Completed session';
  
  const dateFormatted = new Date(recordedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailSubject = `🎥 Your MeetSphere Meeting Recording is Ready: ${roomName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0f17; color: #f1f5f9; padding: 20px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #131826; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .badge { display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #818cf8; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        h1 { font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; color: #ffffff; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .card { background: #0c0f17; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .card-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
        .card-label { color: #64748b; font-weight: 600; }
        .card-value { color: #f8fafc; font-weight: 600; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 10px; text-align: center; }
        .footer { margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #475569; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">MeetSphere Cloud Recording</div>
        <h1>Meeting Session Recorded</h1>
        <p>Your cloud recording for room <strong>${roomName}</strong> is fully processed and ready for playback or download.</p>
        
        <div class="card">
          <div class="card-item">
            <span class="card-label">Room Identifier</span>
            <span class="card-value">${roomName}</span>
          </div>
          <div class="card-item">
            <span class="card-label">Recorded At</span>
            <span class="card-value">${dateFormatted}</span>
          </div>
          <div class="card-item">
            <span class="card-label">Duration</span>
            <span class="card-value">${durationFormatted}</span>
          </div>
          <div class="card-item" style="margin-bottom:0;">
            <span class="card-label">Delivered To</span>
            <span class="card-value">${to}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${fileUrl}" target="_blank" class="btn">▶ Watch & Download Recording</a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
          Direct Link: <a href="${fileUrl}" style="color: #818cf8; word-break: break-all;">${fileUrl}</a>
        </p>

        <div class="footer">
          MeetSphere Enterprise Video Workspace • High-Performance WebRTC Media Platform
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"MeetSphere Video" <${process.env.SMTP_FROM || 'no-reply@meetsphere.com'}>`,
        to,
        subject: emailSubject,
        html: htmlContent
      });
      console.log(`[emailService] Recording notification email successfully sent to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, deliveredTo: to };
    } catch (err) {
      console.error(`[emailService] Failed to send email via SMTP:`, err.message);
      // Don't fail the recording process if SMTP fails
      return { success: false, error: err.message, deliveredTo: to };
    }
  } else {
    // Development console log output
    console.log(`\n================================================================`);
    console.log(`[emailService - DEV MODE SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Room: ${roomName} | Duration: ${durationFormatted}`);
    console.log(`Recording Link: ${fileUrl}`);
    console.log(`================================================================\n`);
    return { success: true, simulated: true, deliveredTo: to };
  }
}

export default {
  sendRecordingEmail
};
