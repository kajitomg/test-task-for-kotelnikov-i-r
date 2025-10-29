/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropTable
DROP TABLE "public"."users";
