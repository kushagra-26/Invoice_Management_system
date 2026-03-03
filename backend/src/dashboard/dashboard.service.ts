import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from '../invoices/schemas/invoice.schema';

@Injectable()
export class DashboardService {

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
  ) {}

  async getStats(userId: string) {
    const invoices = await this.invoiceModel.find({ userId });

    const totalRevenue = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const pendingInvoices = invoices
      .filter(inv => inv.status === "pending").length;

    return {
      totalRevenue,
      pendingInvoices,
      totalInvoices: invoices.length,
    };
  }
}