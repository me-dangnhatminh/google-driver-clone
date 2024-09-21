-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "owner_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3),
    "content_type" TEXT NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_hierarchy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "owner_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3),
    "root_id" TEXT,
    "parent_id" TEXT,
    "depth" INTEGER NOT NULL,
    "lft" INTEGER NOT NULL,
    "rgt" INTEGER NOT NULL,

    CONSTRAINT "folder_hierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_in_folder" (
    "file_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,

    CONSTRAINT "file_in_folder_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "my_storage" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "ref_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "my_storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folder_hierarchy_lft_rgt_idx" ON "folder_hierarchy"("lft", "rgt");

-- CreateIndex
CREATE UNIQUE INDEX "my_storage_owner_id_key" ON "my_storage"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "my_storage_ref_id_key" ON "my_storage"("ref_id");

-- CreateIndex
CREATE INDEX "my_storage_owner_id_idx" ON "my_storage"("owner_id");

-- AddForeignKey
ALTER TABLE "folder_hierarchy" ADD CONSTRAINT "folder_hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_hierarchy" ADD CONSTRAINT "folder_hierarchy_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_in_folder" ADD CONSTRAINT "file_in_folder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_in_folder" ADD CONSTRAINT "file_in_folder_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "my_storage" ADD CONSTRAINT "my_storage_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "folder_hierarchy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
