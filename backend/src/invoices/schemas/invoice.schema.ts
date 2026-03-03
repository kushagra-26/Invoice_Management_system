import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice extends Document {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  clientEmail: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: "pending" })
  status: string; // pending | paid | overdue

  @Prop()
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);