import nodemailer from 'nodemailer';

// Create transporter with proper configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates in development
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Store accent color
const ACCENT_COLOR = '#16a34a'; // Green color for Mwambo Store

// Send order confirmation email
export const sendOrderConfirmation = async (orderData) => {
  try {
    const { orderNumber, customer, items, total, guestToken } = orderData;

    const itemsList = items.map(item => 
      `<tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;">${item.quantity}x ${item.name}</td>
        <td style="padding: 10px 0; text-align: right;">MK ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: `"Mwambo Store" <${process.env.EMAIL_FROM || 'orders@mwambo.store'}>`,
      to: customer.email,
      subject: `Order Confirmation #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${ACCENT_COLOR}; margin: 0;">Mwambo Store</h1>
            <p style="color: #666; font-size: 14px;">Your Trusted Local Store</p>
          </div>
          
          <h2 style="color: #333;">Thank You for Your Order!</h2>
          
          <p>Hi ${customer.name},</p>
          
          <p>Your order has been confirmed and is being processed. We'll notify you when it ships.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: ${ACCENT_COLOR}; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-MW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            
            <h4 style="color: #333; margin-top: 20px;">Items</h4>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsList}
              <tr>
                <td style="padding: 15px 0 5px; font-weight: bold;">Total</td>
                <td style="padding: 15px 0 5px; text-align: right; font-weight: bold; color: ${ACCENT_COLOR};">MK ${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #333;">Track Your Order</h3>
            <p>You can track your order status anytime using the link below:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${guestToken}" 
               style="background-color: ${ACCENT_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Track Order
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
            <p style="margin: 5px 0;">Thank you for choosing Mwambo Store!</p>
            <p style="margin: 5px 0;">If you have any questions, contact us at:</p>
            <p style="margin: 5px 0;">📧 <a href="mailto:support@mwambo.store" style="color: ${ACCENT_COLOR};">support@mwambo.store</a></p>
            <p style="margin: 5px 0;">📞 +265 999 123 456</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${customer.email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    // Don't throw - email failure shouldn't break the order
  }
};

// Send subscription confirmation email
export const sendSubscriptionConfirmationEmail = async (email, data) => {
  try {
    const { subscriptionNumber, customerName, planName, startDate, nextDeliveryDate, totalPaid, managementLink } = data;

    const mailOptions = {
      from: `"Mwambo Subscriptions" <${process.env.EMAIL_FROM || 'subscriptions@mwambo.store'}>`,
      to: email,
      subject: `Subscription Confirmation #${subscriptionNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${ACCENT_COLOR}; margin: 0;">Mwambo Store</h1>
            <p style="color: #666; font-size: 14px;">Smart Subscriptions</p>
          </div>
          
          <h2 style="color: #333;">Welcome to Subscription Service!</h2>
          
          <p>Hi ${customerName},</p>
          
          <p>Thank you for subscribing to Mwambo Store. Your subscription has been successfully activated.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: ${ACCENT_COLOR}; margin-top: 0;">Subscription Details</h3>
            <p><strong>Subscription Number:</strong> ${subscriptionNumber}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString('en-MW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Next Delivery:</strong> ${new Date(nextDeliveryDate).toLocaleDateString('en-MW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Amount Paid:</strong> <span style="color: ${ACCENT_COLOR}; font-weight: bold;">MK ${totalPaid.toFixed(2)}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #333;">Manage Your Subscription</h3>
            <p>You can pause, resume, or update your subscription anytime:</p>
            <a href="${managementLink}" 
               style="background-color: ${ACCENT_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Manage Subscription
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
            <p style="margin: 5px 0;">We're excited to have you with us!</p>
            <p style="margin: 5px 0;">For subscription support: 📧 <a href="mailto:subscriptions@mwambo.store" style="color: ${ACCENT_COLOR};">subscriptions@mwambo.store</a></p>
            <p style="margin: 5px 0;">📞 +265 999 123 456</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription confirmation email sent to ${email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending subscription confirmation email:', error);
    // Don't throw - email failure shouldn't break the subscription
  }
};

// Send management links email
export const sendManagementEmail = async (email, links) => {
  try {
    if (!email || !links || links.length === 0) {
      console.log('No email or links provided for management email');
      return;
    }

    const linksList = links.map(link => 
      `<tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${link.planName}</td>
        <td style="padding: 12px 0;">
          <span style="background-color: ${link.status === 'active' ? '#e6f7e6' : '#fff3cd'}; color: ${link.status === 'active' ? '#2e7d32' : '#856404'}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${link.status}
          </span>
        </td>
        <td style="padding: 12px 0;">
          <a href="${link.managementLink}" style="color: ${ACCENT_COLOR}; text-decoration: none; font-weight: bold;">
            Manage →
          </a>
        </td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: `"Mwambo Subscriptions" <${process.env.EMAIL_FROM || 'subscriptions@mwambo.store'}>`,
      to: email,
      subject: 'Your Subscription Management Links',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${ACCENT_COLOR}; margin: 0;">Mwambo Store</h1>
            <p style="color: #666; font-size: 14px;">Manage Your Subscriptions</p>
          </div>
          
          <h2 style="color: #333;">Your Subscriptions</h2>
          
          <p>Hi there,</p>
          
          <p>Here are your active subscriptions with Mwambo Store. Click "Manage" to view details, pause, or update each subscription.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 12px; text-align: left;">Plan</th>
                <th style="padding: 12px; text-align: left;">Status</th>
                <th style="padding: 12px; text-align: left;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${linksList}
            </tbody>
          </table>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Note:</strong> These links will expire in 24 hours for security. If you need new links, visit our website and request them again.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
            <p style="margin: 5px 0;">Thank you for being a subscriber!</p>
            <p style="margin: 5px 0;">Need help? Contact us at:</p>
            <p style="margin: 5px 0;">📧 <a href="mailto:subscriptions@mwambo.store" style="color: ${ACCENT_COLOR};">subscriptions@mwambo.store</a></p>
            <p style="margin: 5px 0;">📞 +265 999 123 456</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Management links email sent to ${email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending management email:', error);
    // Don't throw - email failure shouldn't break the flow
  }
};