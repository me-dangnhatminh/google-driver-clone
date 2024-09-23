-- CreateTable
CREATE TABLE "file_permission" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "perm" TEXT NOT NULL,

    CONSTRAINT "file_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_shared" (
    "id" TEXT NOT NULL,
    "perm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "file_shared_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_permission" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "perm" TEXT NOT NULL,

    CONSTRAINT "folder_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_shared" (
    "id" TEXT NOT NULL,
    "perm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "folder_shared_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_permission_file_id_key" ON "file_permission"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "folder_permission_folder_id_key" ON "folder_permission"("folder_id");

-- AddForeignKey
ALTER TABLE "file_permission" ADD CONSTRAINT "file_permission_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_shared" ADD CONSTRAINT "file_shared_perm_id_fkey" FOREIGN KEY ("perm_id") REFERENCES "file_permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_permission" ADD CONSTRAINT "folder_permission_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_shared" ADD CONSTRAINT "folder_shared_perm_id_fkey" FOREIGN KEY ("perm_id") REFERENCES "folder_permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
