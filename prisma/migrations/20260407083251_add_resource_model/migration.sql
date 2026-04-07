-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ResourceToResourceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ResourceToResourceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ResourceToResourceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ResourceTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTag_name_key" ON "ResourceTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ResourceToResourceTag_AB_unique" ON "_ResourceToResourceTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ResourceToResourceTag_B_index" ON "_ResourceToResourceTag"("B");
