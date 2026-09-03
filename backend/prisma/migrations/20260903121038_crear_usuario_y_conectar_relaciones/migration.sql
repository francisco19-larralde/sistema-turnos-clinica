/*
  Warnings:

  - You are about to drop the column `apellido` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `apellido` on the `Profesional` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Profesional` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricula]` on the table `Profesional` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId]` on the table `Profesional` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Profesional` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRATIVO', 'PROFESIONAL', 'PACIENTE');

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "apellido",
DROP COLUMN "nombre",
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Profesional" DROP COLUMN "apellido",
DROP COLUMN "nombre",
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_key" ON "Paciente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_matricula_key" ON "Profesional"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_usuarioId_key" ON "Profesional"("usuarioId");

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
