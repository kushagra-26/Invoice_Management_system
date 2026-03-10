import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendInvoiceEmail(invoice: any) {
    const itemsHtml = invoice.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.description}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${Number(item.price).toFixed(2)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">₹${Number(item.total).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const taxAmount = (invoice.subtotal * invoice.tax) / 100;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <div style="background:#4f46e5;padding:28px 32px;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Invoice SaaS</h1>
          <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px;">Professional Invoice Management</p>
        </div>

        <!-- Invoice Meta -->
        <div style="padding:28px 32px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Invoice Number</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1e293b;">${invoice.invoiceNumber}</p>
              </td>
              <td style="text-align:right;">
                <span style="display:inline-block;background:#fef9c3;color:#854d0e;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">PAYMENT PENDING</span>
              </td>
            </tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <tr>
              <td style="padding-right:24px;">
                <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Billed To</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${invoice.clientName}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${invoice.clientEmail}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Issue Date</p>
                <p style="margin:4px 0 0;font-size:13px;color:#1e293b;">${new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Due Date</p>
                <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#ef4444;">${new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Rate</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Totals -->
          <div style="margin-top:20px;border-top:2px solid #e2e8f0;padding-top:16px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:60%;"></td>
                <td>
                  <table style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#64748b;">Subtotal</td>
                      <td style="padding:4px 0;font-size:13px;color:#1e293b;text-align:right;">₹${Number(invoice.subtotal).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#64748b;">Tax (${invoice.tax}%)</td>
                      <td style="padding:4px 0;font-size:13px;color:#1e293b;text-align:right;">₹${taxAmount.toFixed(2)}</td>
                    </tr>
                    <tr style="border-top:1px solid #e2e8f0;">
                      <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#1e293b;">Total Due</td>
                      <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#4f46e5;text-align:right;">₹${Number(invoice.total).toFixed(2)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          ${invoice.notes ? `<div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;border-left:3px solid #4f46e5;"><p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:4px;">Notes</p><p style="margin:0;font-size:13px;color:#475569;">${invoice.notes}</p></div>` : ''}
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">This invoice was generated by <strong>Invoice SaaS</strong>. Please make payment by the due date.</p>
        </div>

      </div>`;

    try {
      await this.transporter.sendMail({
        from: `"Invoice SaaS" <${process.env.EMAIL_USER}>`,
        to: invoice.clientEmail,
        subject: `Invoice ${invoice.invoiceNumber} — ₹${Number(invoice.total).toFixed(2)} Due`,
        html,
      });
    } catch (err) {
      console.error('Failed to send invoice email:', err.message);
    }
  }
}
