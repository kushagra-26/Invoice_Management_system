import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    private mailService: MailService,
  ) { }

async create(userId: string, data: any) {
  const itemsWithTotals = data.items.map((item: any) => {

    const quantity = Number(item.quantity);
    const price = Number(item.price);

    const total = quantity * price;

    return {
      description: item.description,
      quantity,
      price,
      total,
    };
  });

  const subtotal = itemsWithTotals.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  const tax = Number(data.tax || 0);
  const discount = Number(data.discount || 0);

  const taxAmount = subtotal * (tax / 100);
  const discountAmount = subtotal * (discount / 100);

  const total = subtotal + taxAmount - discountAmount;

  const invoice = new this.invoiceModel({
    userId,
    invoiceNumber: `INV-${Date.now()}`,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    items: itemsWithTotals,
    subtotal,
    tax,
    discount,
    total,
    status: "pending",
    notes: data.notes,
  });

  const saved = await invoice.save();
  await this.mailService.sendInvoiceEmail(saved);
  return saved;
}

  async findByUser(userId: string) {
    const invoices = await this.invoiceModel.find({ userId });

    const today = new Date();

    return invoices.map((invoice) => {
      if (
        invoice.status === "pending" &&
        new Date(invoice.dueDate) < today
      ) {
        invoice.status = "overdue";
      }

      return invoice;
    });
  }

  async markAsPaid(invoiceId: string, userId: string) {
    return this.invoiceModel.findOneAndUpdate(
      { _id: invoiceId, userId },
      { status: "paid" },
      { new: true }
    );
  }
}