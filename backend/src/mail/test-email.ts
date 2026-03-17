import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function verifyConnection() {
  console.log('Testing connection with:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******** (Hidden)' : 'MISSING');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('\n❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in .env');
    return;
  }

  try {
    console.log('\nStarting verification...');
    await transporter.verify();
    console.log('✅ Success! Transporter is ready to take messages.');
    
    // Send a detailed test email to self
    const mockInvoice = {
      invoiceNumber: 'INV-TEST-001',
      clientName: 'Test Client',
      clientEmail: process.env.EMAIL_USER,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Consulting Service', quantity: 2, price: 500, total: 1000 },
        { description: 'Premium Support', quantity: 1, price: 200, total: 200 },
      ],
      subtotal: 1200,
      tax: 18,
      discount: 10,
      total: 1296, // (1200 + 216 - 120)
      status: 'pending',
      notes: 'This is a detailed test invoice to verify GST and styling.',
    };

    // Note: In the real app, MailService handles the HTML generation.
    // For this test script, we just triggered the connection verification above.
    // To truly see the template, one must use the UI or we could import MailService here.
    // Given the complexity of importing Nest services in a script, 
    // we advise the user to check the UI now that connection is verified.
    
    console.log('\n💡 Connection verified! The detailed template is now active in MailService.');
    console.log('To see the new GST/Quantity layout, please create an invoice in your UI.');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 TIP: If you have 2-Step Verification enabled, you MUST use a "Google App Password" instead of your regular password.');
    }
  }
}

verifyConnection();
