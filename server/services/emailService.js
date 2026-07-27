import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.log(`[Email Service Simulation] Welcome email queued for ${userEmail} (${userName})`);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"CMS Blog Platform" <${emailUser}>`,
      to: userEmail,
      subject: `Welcome to CMS Blog, ${userName}! 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">Welcome to CMS Blog, ${userName}! 👋</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for registering your account on <strong>CMS Blog</strong>. You are now officially a part of our tech publishing community!
          </p>
          <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1f2937; font-weight: bold;">What you can do next:</p>
            <ul style="color: #4b5563; margin-top: 8px; padding-left: 20px;">
              <li>Customize your Profile (avatar, bio, social links)</li>
              <li>Publish & edit your articles</li>
              <li>Follow other authors & engage with comments</li>
              <li>Send direct messages to your followers</li>
            </ul>
          </div>
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">
            Log In to Your Account
          </a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you did not create this account, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Welcome email successfully sent to ${userEmail}`);
  } catch (error) {
    console.error(`[Email Service Warning] Could not send email: ${error.message}`);
  }
};
