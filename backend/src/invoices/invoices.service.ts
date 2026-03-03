import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from './schemas/invoice.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesService {

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
  ) {}

async create(userId: string, data: any) {

  // Calculate line totals
  const itemsWithTotals = data.items.map((item: any) => {
    const itemTotal = item.quantity * item.price;
    return {
      ...item,
      total: itemTotal,
    };
  });

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );

  // Calculate tax
  const taxAmount = subtotal * (data.tax / 100);

  // Calculate discount
  const discountAmount = subtotal * (data.discount / 100);

  // Final total
  const total = subtotal + taxAmount - discountAmount;

  const invoice = new this.invoiceModel({
    userId,
    invoiceNumber: `INV-${Date.now()}`,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    items: itemsWithTotals,
    tax: data.tax,
    discount: data.discount,
    subtotal,
    total,
    status: "pending",
    notes: data.notes,
  });

  return invoice.save();
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