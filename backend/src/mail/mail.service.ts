import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendInvoiceEmail(invoice: any) {
    this.logger.log(`Attempting to send invoice email to: ${invoice.clientEmail}`);

    if (!invoice.clientEmail) {
      this.logger.error('No client email provided for invoice');
      return;
    }

    const taxAmount = (invoice.subtotal * (invoice.tax || 0)) / 100;
    const discountAmount = (invoice.subtotal * (invoice.discount || 0)) / 100;

    const itemsHtml = invoice.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:12px 15px; border-bottom:1px solid #edf2f7;">
            <div style="font-weight:600; color:#2d3748;">${item.description}</div>
          </td>
          <td style="padding:12px 15px; border-bottom:1px solid #edf2f7; text-align:center; color:#4a5568;">${item.quantity}</td>
          <td style="padding:12px 15px; border-bottom:1px solid #edf2f7; text-align:right; color:#4a5568;">₹${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding:12px 15px; border-bottom:1px solid #edf2f7; text-align:right; font-weight:600; color:#2d3748;">₹${Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>`,
      )
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }
    .container { 
      max-width: 650px; 
      margin: 40px auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 20px 50px rgba(0,0,0,0.1); 
      border: 1px solid #e2e8f0; 
    }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px; color: white; text-align: center; }
    .content { padding: 40px; }
    .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #edf2f7; }
    .meta-box h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; }
    .meta-box p { margin: 0; font-weight: 600; color: #2d3748; }
    .table-container { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table-header { background-color: #f8fafc; }
    .table-header th { padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase; border-bottom: 2px solid #edf2f7; }
    .summary-section { margin-left: auto; width: 250px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary-row.total { border-top: 2px solid #edf2f7; margin-top: 10px; padding-top: 15px; font-weight: 800; font-size: 18px; color: #4f46e5; }
    .footer { padding: 30px; background-color: #f8fafc; text-align: center; font-size: 13px; color: #a0aec0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-pending { background-color: #fffaf0; color: #9c4221; }
    .badge-paid { background-color: #f0fff4; color: #22543d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size:28px; letter-spacing:-0.025em;">INVOICE</h1>
      <p style="margin:10px 0 0 0; opacity: 0.9;">${invoice.invoiceNumber}</p>
    </div>
    
    <div class="content">
      <div style="display: table; width: 100%; margin-bottom: 40px;">
        <div style="display: table-cell; width: 50%;">
          <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #718096;">Billed To</h4>
          <p style="margin: 0; font-weight: 700; font-size: 16px;">${invoice.clientName}</p>
          <p style="margin: 2px 0 0 0; color: #4a5568;">${invoice.clientEmail}</p>
        </div>
        <div style="display: table-cell; width: 50%; text-align: right;">
          <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #718096;">Status</h4>
          <span class="badge ${invoice.status === 'paid' ? 'badge-paid' : 'badge-pending'}">${invoice.status.toUpperCase()}</span>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #718096;">Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
          <p style="margin: 2px 0 0 0; font-size: 13px; color: #e53e3e; font-weight: 600;">Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <table class="table-container">
        <thead>
          <tr class="table-header">
            <th style="width: 50%;">Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-row">
          <span style="color: #718096;">Subtotal</span>
          <span style="font-weight: 600;">₹${Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-row">
          <span style="color: #718096;">GST (${invoice.tax}%)</span>
          <span style="font-weight: 600; color: #e53e3e;">+ ₹${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        ${invoice.discount > 0 ? `
        <div class="summary-row">
          <span style="color: #718096;">Discount (${invoice.discount}%)</span>
          <span style="font-weight: 600; color: #38a169;">- ₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>` : ''}
        <div class="summary-row total">
          <span>Total</span>
          <span>₹${Number(invoice.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${invoice.notes ? `
      <div style="margin-top: 50px; padding: 20px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
        <h4 style="margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #718096;">Notes</h4>
        <p style="margin: 0; font-size: 14px; color: #4a5568;">${invoice.notes}</p>
      </div>` : ''}
    </div>

    <div class="footer">
      <p style="margin-bottom: 5px;">Thank you for your business!</p>
      <p style="margin: 0;">This is a computer-generated invoice from <strong>InvoiceSaaS</strong>.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      this.logger.log(`Using sender: ${this.configService.get('EMAIL_USER')}`);
      await this.transporter.sendMail({
        from: `"Invoice SaaS" <${this.configService.get('EMAIL_USER')}>`,
        to: invoice.clientEmail,
        subject: `Invoice ${invoice.invoiceNumber} from InvoiceSaaS`,
        html,
      });
      this.logger.log(`✅ Email successfully sent to ${invoice.clientEmail}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send invoice email to ${invoice.clientEmail}: ${err.message}`);
    }
  }
}
