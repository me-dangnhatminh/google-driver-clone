import { z } from 'zod';
import { randomUUID as uuid } from 'crypto';
// model PlanCategory {
//   id          String  @id
//   name        String  @unique @map("name")
//   description String? @map("description")
//   plans       Plan[]
// }

// model Plan {
//   id         String        @id
//   categoryId String        @map("category_id")
//   name       String        @map("name")
//   price      String        @map("price")
//   currency   String        @map("currency")
//   duration   String        @map("duration")
//   metadata   Json?         @map("metadata")
//   category   PlanCategory? @relation(fields: [categoryId], references: [id])
// }

// model Invoice {
//   id             String   @id
//   subscriptionId String   @map("subscription_id")
//   amount         String   @map("amount")
//   currency       String   @map("currency")
//   status         String   @map("status")
//   issueDate      DateTime @map("issue_date") @db.Timestamp()
//   dueDate        DateTime @map("due_date") @db.Timestamp()
//   metadata       Json?    @map("metadata")
// }

// model Subscription {
//   id        String   @id
//   accountId String   @map("account_id")
//   planId    String   @map("plan_id")
//   status    String   @map("status") // active, inactive
//   startDate DateTime @map("start_date") @db.Timestamp()
//   endDate   DateTime @map("end_date") @db.Timestamp()
//   metadata  Json?    @map("metadata")
// }

// export const Day = z.coerce.number().min(0);
// export const Currency = z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, {
//   message: `Invalid currency format. ISO 4217[4] currency code`,
// });
// export const CurrencyType = z.string();
export const UUID = z.string().uuid();
export const Currency = z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, {
  message: `Invalid currency format. ISO 4217[4] currency code`,
});
export const Day = z.coerce.number().int().min(0);
export const Metadata = z.record(z.any()).nullable();
export const Customer = z.object({
  id: z.string(),
});

export const PlanCategory = z.object({
  id: UUID.default(uuid),
  name: z.string().min(3).max(255),
  description: z.string().nullable(),
});

export const Plan = z.object({
  id: UUID.default(uuid),
  name: z.string().min(3).max(255),
  price: z.string(),
  currency: Currency,
  duration: Day,
  metadata: Metadata,
  category: PlanCategory.nullable(), // 'null' is for 'uncategorized'
  status: z.string(),
});

export const Subscription = z.object({
  id: UUID.default(uuid),
  customer: Customer,
  plan: Plan,
  startDate: z.string(),
  endDate: z.string(),
  metadata: Metadata,
});

// export const Invoice = z.object({
//   id: z.string(),
//   subscriptionId: z.string(),
//   amount: z.string(),
//   currency: Currency,
//   status: z.string(),
//   issueDate: z.string(),
//   dueDate: z.string(),
//   metadata: z.record(z.any()).nullable(),
// });
