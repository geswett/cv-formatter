const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extrae texto plano de un archivo de CV (PDF o Word).
 * @param {string} filePath - ruta al archivo subido
 * @param {string} originalName - nombre original (para saber la extensión)
 * @returns {Promise<string>} texto plano del CV
 */
async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx" || ext === ".doc") {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  }

  throw new Error(
    `Formato de archivo no soportado: ${ext}. Solo se aceptan PDF y Word (.docx).`
  );
}

module.exports = { extractText };
