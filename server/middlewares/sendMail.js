import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' or your SMTP host
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter setup error:', error);
  } else {
    console.log('Email transporter is ready');
  }
});

const sendMail = async (to, subject, data) => {
  const { name, otp } = data;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Hello ${name},\nYour OTP for ElearningX verification is: ${otp}. This OTP is valid for 5 minutes.\nThank you!`
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;