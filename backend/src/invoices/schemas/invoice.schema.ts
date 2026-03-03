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

  @Prop({
    type: [
      {
        description: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    required: true,
  })
  items: {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: "pending" })
  status: string;

  @Prop()
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);