import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Razorpay from 'razorpay';
import { Invoice } from '../invoices/schemas/invoice.schema';

@Injectable()
export class PaymentsService {

  private razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
  ) { }

  async createOrder(data: any) {
    const { invoiceId } = data;

    if (!invoiceId) {
      throw new BadRequestException('invoiceId is required');
    }

    // Fetch the invoice directly from the DB — the single source of truth for the total
    const invoice = await this.invoiceModel.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    const total = Number(invoice.total);

    console.log(`Creating Razorpay order for invoice ${invoiceId}: total = ${total}`);

    if (!total || total <= 0) {
      throw new BadRequestException(
        `Invoice total is ₹${total}. Please add items with a valid price before paying.`
      );
    }

    const options = {
      amount: Math.round(total * 100), // Razorpay expects paise (integers)
      currency: 'INR',
      receipt: `invoice_${invoiceId}`,
    };

    const order = await this.razorpay.orders.create(options);
    return order;
  }
}