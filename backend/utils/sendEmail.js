const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendRecommendationEmail = async (toEmail, product) => {
  const productTitleQuery = encodeURIComponent(product.name);
  const productLink = `http://localhost:3000/search?query=${productTitleQuery}`;

  const msg = {
    to: toEmail,
    from: 'sannyjad@gmail.com', // ✅ Replace with verified domain email for best deliverability
    subject: `🎯WalMart- Recommended for You: ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; color: #333;">
        <h2 style="color: #4CAF50;">Hey there 👋</h2>
        <p>Based on your skin profile, we've found something we think you'll love:</p>

        <div style="text-align: center; margin: 20px 0;">
          <h3 style="margin-bottom: 10px;">${product.name}</h3>
          <img src="${product.images?.main}" alt="${product.name}" width="200" style="border-radius: 8px;" />
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${productLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a>
        </div>

        <hr style="margin: 30px 0;" />

        <p style="font-size: 14px; color: #666;">You received this email because you're subscribed to product recommendations.</p>
        <p style="font-size: 14px; color: #666;">Stay glowing! ✨</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent to:', toEmail);
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
  }
};

module.exports = sendRecommendationEmail;
