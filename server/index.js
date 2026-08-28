import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Resend with API Key from server environment
const resendApiKey = process.env.RESEND_API_KEY || 're_test_key_dummy';
const resend = new Resend(resendApiKey);

// Server Email Audit Logs (in-memory & returned to frontend admin)
const serverEmailLogs = [];

// Helper HTML template for SIH 2026 verification emails
function generateVerificationEmailHtml({ recipientName, teamName, portalUrl, customMessage }) {
  const defaultMessage = `You are required to log into the official Smart India Hackathon (SIH) 2026 Authorization & Consent Verification Portal to verify your nominated team's letter and member details.`;
  const messageBody = customMessage || defaultMessage;
  const targetLink = portalUrl || 'http://localhost:3000';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0d3b66 0%, #001d3d 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #f4a261; }
      .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 0.5px; }
      .header p { margin: 5px 0 0; color: #f4a261; font-weight: 600; font-size: 14px; }
      .content { padding: 30px 25px; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
      .team-box { background: rgba(13, 59, 102, 0.4); border-left: 4px solid #2a9d8f; padding: 15px; border-radius: 6px; margin: 20px 0; }
      .team-box h3 { margin: 0 0 5px; color: #ffffff; font-size: 16px; }
      .team-box p { margin: 0; color: #94a3b8; font-size: 14px; }
      .btn-container { text-align: center; margin: 30px 0; }
      .btn { background: linear-gradient(135deg, #f4a261 0%, #e76f51 100%); color: #0f172a !important; padding: 14px 32px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(244, 162, 97, 0.3); }
      .steps { background: #0f172a; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .steps h4 { margin: 0 0 10px; color: #e9c46a; font-size: 15px; }
      .steps ol { margin: 0; padding-left: 20px; color: #94a3b8; }
      .steps li { margin-bottom: 8px; }
      .footer { background: #090d16; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      .footer a { color: #38bdf8; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Smart India Hackathon 2026</h1>
        <p>Official Authorization & Consent Verification Portal</p>
      </div>
      <div class="content">
        <p>Dear <strong>${recipientName || 'Team Leader'}</strong>,</p>
        <p>${messageBody}</p>
        
        <div class="team-box">
          <h3>Team: ${teamName || 'Nominated Team'}</h3>
          <p>Institution AICTE/UGC Reg No: <strong>1-46260580103</strong></p>
        </div>

        <div class="steps">
          <h4>Required Action Steps:</h4>
          <ol>
            <li>Click the button below to open the Verification Portal.</li>
            <li>Sign in exclusively using your registered Google Email (<strong>${recipientName || 'Team Leader'}</strong>).</li>
            <li>Inspect your team's official PDF Authorization Letter.</li>
            <li>Verify individual member details or report any discrepancies.</li>
            <li>Click <strong>"Submit Verification"</strong> to complete the process.</li>
          </ol>
        </div>

        <div class="btn-container">
          <a href="${targetLink}" class="btn" target="_blank">Access Verification Portal &rarr;</a>
        </div>

        <p style="font-size: 13px; color: #94a3b8;">
          Note: Under SIH 2026 regulations, team letters are securely isolated. You will only have access to your assigned team document.
        </p>
      </div>
      <div class="footer">
        <p>Smart India Hackathon 2026 &copy; All Rights Reserved.</p>
        <p style="margin-top: 6px;">This portal is developed and managed by <a href="https://netsyc.com/?utm_source=chatgpt.com" target="_blank">NetSyc Technologies Pvt. Ltd.</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// GET Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET Email Sending Logs
app.get('/api/email-logs', (req, res) => {
  res.json({ success: true, logs: serverEmailLogs });
});

// POST Send Single Verification Email
app.post('/api/send-email', async (req, res) => {
  const { recipientEmail, recipientName, teamName, portalUrl, customSubject, customMessage } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ success: false, error: 'Recipient email is required' });
  }

  const subject = customSubject || `[ACTION REQUIRED] SIH 2026 Team Authorization Verification - ${teamName || 'Team'}`;
  const html = generateVerificationEmailHtml({ recipientName, teamName, portalUrl, customMessage });

  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    recipient: recipientEmail,
    recipientName: recipientName || recipientEmail,
    teamName: teamName || 'N/A',
    subject,
    sentAt: new Date().toISOString(),
    status: 'PENDING',
    resendId: null,
    error: null,
  };

  try {
    // Check if API key is real Resend key
    if (resendApiKey && resendApiKey.startsWith('re_') && !resendApiKey.includes('dummy')) {
      const data = await resend.emails.send({
        from: 'SIH 2026 Portal <onboarding@resend.dev>',
        to: [recipientEmail],
        subject,
        html,
      });

      if (data.error) {
        logEntry.status = 'FAILED';
        logEntry.error = data.error.message || 'Resend error';
      } else {
        logEntry.status = 'DELIVERED';
        logEntry.resendId = data.id;
      }
    } else {
      // Simulation mode when real key is not set in env
      console.log(`[SIMULATED RESEND EMAIL] To: ${recipientEmail} | Subject: ${subject}`);
      logEntry.status = 'DELIVERED (SIMULATED)';
      logEntry.resendId = 'sim_' + Date.now();
    }

    serverEmailLogs.unshift(logEntry);
    res.json({ success: logEntry.status.includes('DELIVERED'), log: logEntry });
  } catch (err) {
    console.error('Resend email error:', err);
    logEntry.status = 'FAILED';
    logEntry.error = err.message || 'Server email error';
    serverEmailLogs.unshift(logEntry);
    res.status(500).json({ success: false, error: logEntry.error, log: logEntry });
  }
});

// POST Send Bulk Emails
app.post('/api/send-bulk-email', async (req, res) => {
  const { recipients, customSubject, customMessage, portalUrl } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ success: false, error: 'Valid recipients array required' });
  }

  const results = [];
  for (const item of recipients) {
    const { email, name, teamName } = item;
    const subject = customSubject || `[ACTION REQUIRED] SIH 2026 Team Authorization Verification - ${teamName || 'Team'}`;
    const html = generateVerificationEmailHtml({ recipientName: name, teamName, portalUrl, customMessage });

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      recipient: email,
      recipientName: name || email,
      teamName: teamName || 'N/A',
      subject,
      sentAt: new Date().toISOString(),
      status: 'PENDING',
      resendId: null,
      error: null,
    };

    try {
      if (resendApiKey && resendApiKey.startsWith('re_') && !resendApiKey.includes('dummy')) {
        const data = await resend.emails.send({
          from: 'SIH 2026 Portal <onboarding@resend.dev>',
          to: [email],
          subject,
          html,
        });

        if (data.error) {
          logEntry.status = 'FAILED';
          logEntry.error = data.error.message;
        } else {
          logEntry.status = 'DELIVERED';
          logEntry.resendId = data.id;
        }
      } else {
        logEntry.status = 'DELIVERED (SIMULATED)';
        logEntry.resendId = 'sim_' + Date.now();
      }
    } catch (err) {
      logEntry.status = 'FAILED';
      logEntry.error = err.message;
    }

    serverEmailLogs.unshift(logEntry);
    results.push(logEntry);
  }

  res.json({ success: true, count: results.length, logs: results });
});

app.listen(PORT, () => {
  console.log(`SIH 2026 Portal Express Server running on http://localhost:${PORT}`);
});
