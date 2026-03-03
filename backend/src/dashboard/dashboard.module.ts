import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema }
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}