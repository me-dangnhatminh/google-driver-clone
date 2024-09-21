-- CreateTable
CREATE TABLE "PlanCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "PlanCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issue_date" TIMESTAMP NOT NULL,
    "due_date" TIMESTAMP NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "checkoutId" TEXT NOT NULL,
    "buyerInfo" TEXT NOT NULL,
    "sellerInfo" TEXT NOT NULL,
    "creditCardInfo" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("checkoutId")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "paymentOrderId" TEXT NOT NULL,
    "buyerAccountId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ledgerUpdated" BOOLEAN NOT NULL,
    "walletUpdated" BOOLEAN NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("paymentOrderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanCategory_name_key" ON "PlanCategory"("name");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "PlanCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
