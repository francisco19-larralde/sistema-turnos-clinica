CREATE TABLE "BloqueoDisponibilidad" (
  "id" SERIAL NOT NULL,
  "fecha" DATE NOT NULL,
  "motivo" TEXT NOT NULL,
  "profesionalId" INTEGER NOT NULL,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BloqueoDisponibilidad_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BloqueoDisponibilidad_profesionalId_fecha_key" ON "BloqueoDisponibilidad"("profesionalId", "fecha");
ALTER TABLE "BloqueoDisponibilidad" ADD CONSTRAINT "BloqueoDisponibilidad_profesionalId_fkey"
  FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
