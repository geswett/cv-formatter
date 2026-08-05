const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const { extractText } = require("../lib/extractText");
const { extractStructuredCv } = require("../lib/claudeExtract");
const { buildDocx } = require("../lib/buildDocx");
const { convertToPdf } = require("../lib/convertToPdf");

const router = express.Router();

const WORK_DIR = path.join(os.tmpdir(), "cv-formatter");
fs.mkdirSync(WORK_DIR, { recursive: true });

const upload = multer({
  dest: WORK_DIR,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx?|DOCX?|PDF)$/.test(file.originalname);
    cb(ok ? null : new Error("Solo se aceptan archivos PDF o Word (.docx)."), ok);
  },
});

// En memoria: id -> { docxPath, pdfPath, nombre }. Alcanza para un MVP de un solo
// servidor; para producción con más de una instancia, mover a un storage compartido.
const jobs = new Map();

router.post("/process-cv", upload.single("cv"), async (req, res) => {
  const uploadedPath = req.file && req.file.path;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const rawText = await extractText(uploadedPath, req.file.originalname);
    if (!rawText || rawText.trim().length < 20) {
      return res.status(422).json({
        error:
          "No se pudo leer texto del archivo. Si es un PDF escaneado (imagen), no es soportado por ahora.",
      });
    }

    const data = await extractStructuredCv(rawText);

    const id = crypto.randomBytes(8).toString("hex");
    const docxBuffer = await buildDocx(data);
    const docxPath = path.join(WORK_DIR, `${id}.docx`);
    fs.writeFileSync(docxPath, docxBuffer);

    const pdfPath = await convertToPdf(docxPath, WORK_DIR);

    jobs.set(id, {
      docxPath,
      pdfPath,
      nombre: data.nombre_completo || "CV",
    });

    res.json({
      id,
      data,
      docxUrl: `/api/download/${id}/docx`,
      pdfUrl: `/api/download/${id}/pdf`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Error inesperado procesando el CV." });
  } finally {
    if (uploadedPath) fs.unlink(uploadedPath, () => {});
  }
});

router.get("/download/:id/:type", (req, res) => {
  const { id, type } = req.params;
  const job = jobs.get(id);
  if (!job) return res.status(404).send("Archivo no encontrado o expirado.");

  const safeName = job.nombre.replace(/[^\w\-]+/g, "_");

  if (type === "docx") {
    return res.download(job.docxPath, `CV_${safeName}.docx`);
  }
  if (type === "pdf") {
    return res.download(job.pdfPath, `CV_${safeName}.pdf`);
  }
  return res.status(400).send("Tipo de archivo inválido.");
});

module.exports = router;
