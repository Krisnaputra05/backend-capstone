const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  console.log("--- Test Email Script ---");
  console.log("Checking Environment Variables...");
  console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "******" + process.env.EMAIL_USER.slice(-4) : "NOT SET");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("ERROR: EMAIL_USER or EMAIL_PASS is missing in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log("Attempting to send email to:", process.env.EMAIL_USER);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: "Test Nodemailer Capstone",
      text: "If you see this, email sending is working!",
    });
    console.log("SUCCESS: Email sent!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("FAILURE: Error sending email.");
    console.error(error);
  }
}

testEmail();
