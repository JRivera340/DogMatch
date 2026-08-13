-- CreateTable
CREATE TABLE "Mascota" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL DEFAULT 'Perro',
    "raza" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'Sin especificar',
    "tamano" TEXT NOT NULL DEFAULT 'Mediano',
    "edad" TEXT NOT NULL DEFAULT 'Adulto',
    "senasParticulares" TEXT NOT NULL DEFAULT '',
    "senas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "otrasSenas" TEXT NOT NULL DEFAULT '',
    "esUrgente" BOOLEAN NOT NULL DEFAULT false,
    "esAsustadiza" BOOLEAN NOT NULL DEFAULT false,
    "fotoUrl" TEXT NOT NULL,
    "ultimaVezFecha" TIMESTAMP(3) NOT NULL,
    "ultimaVezLugarTexto" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "lugarResidencia" TEXT NOT NULL,
    "telefono1" TEXT NOT NULL,
    "telefono2" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'perdida',
    "tipoReporte" TEXT NOT NULL DEFAULT 'perdida',
    "validacion" TEXT NOT NULL DEFAULT 'pendiente',
    "editToken" TEXT NOT NULL,
    "autorizaTratamientoDatos" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mascota_editToken_key" ON "Mascota"("editToken");
