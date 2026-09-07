ALTER TABLE "Turno" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "ReprogramacionTurno" (
  "id" SERIAL NOT NULL,
  "turnoId" INTEGER NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "fechaAnterior" DATE NOT NULL,
  "horaAnterior" TEXT NOT NULL,
  "horaFinAnterior" TEXT NOT NULL,
  "estadoAnterior" "EstadoTurno" NOT NULL,
  "fechaNueva" DATE NOT NULL,
  "horaNueva" TEXT NOT NULL,
  "horaFinNueva" TEXT NOT NULL,
  "motivo" TEXT NOT NULL,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReprogramacionTurno_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReprogramacionTurno_turnoId_creadoEn_id_idx" ON "ReprogramacionTurno"("turnoId", "creadoEn", "id");
ALTER TABLE "ReprogramacionTurno" ADD CONSTRAINT "ReprogramacionTurno_turnoId_fkey"
  FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReprogramacionTurno" ADD CONSTRAINT "ReprogramacionTurno_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
