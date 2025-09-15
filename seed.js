import nodemailer from "nodemailer";

// Always create a fresh Ethereal test account for each email send
export async function createTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Email templates
export function loginEmail(user) {
  return {
    subject: "Login Notification",
    text: `Hello ${user.username}, you have successfully logged in to Telemedicine.`,
  };
}

export function bookingEmail(doctor, patient, booking) {
  return {
    subject: "Booking Confirmed",
    text: `Dear ${patient.username}, your booking with ${doctor.username} is confirmed for ${booking.time}.`,
  };
}

export function doctorOnlineEmail(doctor, patient, url) {
  return {
    subject: "Doctor Online Notification",
    text: `Dear ${patient.username}, your doctor ${doctor.username} is now online. You can join your call here: ${url}`,
  };
}

// Generic send email function (always uses fresh test account)
export async function sendEmail({ to, subject, text }) {
  const transporter = await createTransporter();
  await transporter.verify();
  const info = await transporter.sendMail({
    from: "no-reply@telemedicine.com",
    to,
    subject,
    text,
  });
  return nodemailer.getTestMessageUrl(info);
}

// Exported functions to use anywhere in backend
