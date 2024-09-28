-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "account_id" TEXT,
    "account_isp" TEXT,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_account_id_key" ON "Customer"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
