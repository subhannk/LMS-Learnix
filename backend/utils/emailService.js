const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAbsenceEmail = async (options) => {
  const studentName = options.studentName;
  const courseName = options.courseName;
  const date = options.date;
  const instructorName = options.instructorName;
  const to = options.to;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div style="max-width:580px;margin:0 auto;background:#13131a;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#6c47ff,#ff6b6b);padding:32px 28px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">CyberSquare LMS</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Attendance Notification</p>
      </div>
      <div style="padding:32px 28px;">
        <div style="background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;color:#ff6b6b;font-weight:700;font-size:16px;">⚠️ Absence Recorded</p>
          <p style="margin:6px 0 0;color:rgba(255,107,107,0.7);font-size:13px;">You were marked absent for today's class</p>
        </div>
        <p style="color:#ccc;font-size:15px;line-height:1.7;margin:0 0 16px;">
          Dear <strong style="color:#fff;">${studentName}</strong>,
        </p>
        <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px;">
          You were marked <strong style="color:#ff6b6b;">ABSENT</strong> from the class session. Please make sure to catch up on the material you missed and contact your instructor if needed.
        </p>
        <div style="background:#0d0d16;border-radius:12px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#888;font-size:13px;width:40%;">Course</td>
              <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">${courseName}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.05);">
              <td style="padding:8px 0;color:#888;font-size:13px;">Date</td>
              <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">${formattedDate}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.05);">
              <td style="padding:8px 0;color:#888;font-size:13px;">Instructor</td>
              <td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;">${instructorName}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.05);">
              <td style="padding:8px 0;color:#888;font-size:13px;">Status</td>
              <td style="padding:8px 0;">
                <span style="background:rgba(255,107,107,0.15);color:#ff6b6b;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:700;">ABSENT</span>
              </td>
            </tr>
          </table>
        </div>
        <div style="background:rgba(108,71,255,0.1);border:1px solid rgba(108,71,255,0.2);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0;color:#a78bff;font-size:13px;line-height:1.6;">
            Regular attendance is very important. Students with 75%+ attendance perform much better in assessments and have higher placement rates.
          </p>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding:20px 28px;text-align:center;">
        <p style="color:#444;font-size:12px;margin:0;">2026 CyberSquare - Kerala's #1 Tech Training Institute</p>
        <p style="color:#333;font-size:11px;margin:6px 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: '"CyberSquare LMS" <' + process.env.EMAIL_USER + '>',
    to: to,
    subject: 'Absence Notification - ' + courseName,
    html: html
  });
};

const sendLateEmail = async (options) => {
  const studentName = options.studentName;
  const courseName = options.courseName;
  const date = options.date;
  const instructorName = options.instructorName;
  const to = options.to;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div style="max-width:580px;margin:0 auto;background:#13131a;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;">
      <div style="background:linear-gradient(135deg,#ff9500,#ff6b6b);padding:28px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">CyberSquare LMS</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Late Arrival Notification</p>
      </div>
      <div style="padding:28px;">
        <div style="background:rgba(255,149,0,0.1);border:1px solid rgba(255,149,0,0.3);border-radius:12px;padding:14px 18px;margin-bottom:20px;">
          <p style="margin:0;color:#ff9500;font-weight:700;font-size:15px;">🕐 Late Arrival Recorded</p>
        </div>
        <p style="color:#ccc;font-size:15px;">Dear <strong style="color:#fff;">${studentName}</strong>,</p>
        <p style="color:#aaa;font-size:14px;line-height:1.7;">
          You were marked as <strong style="color:#ff9500;">LATE</strong> for the class on
          <strong style="color:#fff;">${formattedDate}</strong> for <strong style="color:#fff;">${courseName}</strong>.
        </p>
        <p style="color:#888;font-size:13px;line-height:1.7;">
          Please try to arrive on time for future classes. Contact <strong>${instructorName}</strong> if you need help.
        </p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding:16px 28px;text-align:center;">
        <p style="color:#444;font-size:11px;margin:0;">2026 CyberSquare LMS - Automated Message</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: '"CyberSquare LMS" <' + process.env.EMAIL_USER + '>',
    to: to,
    subject: 'Late Arrival Notice - ' + courseName,
    html: html
  });
};

module.exports = { sendAbsenceEmail, sendLateEmail };