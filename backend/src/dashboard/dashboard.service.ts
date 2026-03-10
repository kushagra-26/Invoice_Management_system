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
    const invoices = await this.invoiceModel.find({ userId }).sort({ createdAt: -1 });

    const today = new Date();

    const totalRevenue = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const pendingInvoices = invoices.filter(inv => inv.status === "pending").length;
    const overdueInvoices = invoices.filter(
      inv => inv.status === "pending" && new Date(inv.dueDate) < today,
    ).length;

    const customers = new Set(invoices.map(inv => inv.clientEmail)).size;

    const recentInvoices = invoices.slice(0, 5).map(inv => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate,
    }));

    return {
      totalRevenue,
      pendingInvoices,
      overdueInvoices,
      customers,
      totalInvoices: invoices.length,
      recentInvoices,
    };
  }
}