require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Checking email config...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET OK' : 'NOT SET - CHECK .env FILE');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('ERROR: Email not configured in .env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Gmail connection FAILED:', error.message);
    console.log('');
    console.log('Fix: Make sure you used Gmail App Password, not your regular password!');
    console.log('Get App Password at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('Gmail connection SUCCESS! Sending test email...');

    transporter.sendMail({
      from: '"CyberSquare LMS" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER,
      subject: 'CyberSquare - Email Test Successful!',
      html: `
        <div style="max-width:500px;margin:0 auto;background:#13131a;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#6c47ff,#ff6b6b);padding:28px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">CyberSquare LMS</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;">Email System Working!</p>
          </div>
          <div style="padding:28px;">
            <h2 style="color:#00c851;margin:0 0 12px;">Email is configured correctly!</h2>
            <p style="color:#aaa;font-size:14px;line-height:1.7;">
              Your CyberSquare LMS email system is now ready to send
              attendance notifications to students automatically.
            </p>
            <div style="background:#0d0d16;border-radius:10px;padding:16px;margin-top:16px;">
              <p style="color:#a78bff;font-size:13px;margin:0;">
                When you mark a student as absent and click "Notify",
                they will receive a professional email notification just like this one.
              </p>
            </div>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding:16px;text-align:center;">
            <p style="color:#444;font-size:11px;margin:0;">CyberSquare LMS - Kerala's #1 Tech Institute</p>
          </div>
        </div>
      `
    }, function(err, info) {
      if (err) {
        console.log('Send FAILED:', err.message);
      } else {
        console.log('');
        console.log('TEST EMAIL SENT SUCCESSFULLY!');
        console.log('Check your Gmail inbox now.');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});