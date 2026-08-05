const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Convierte un .docx a .pdf usando LibreOffice headless.
 * Requiere que el binario `soffice` esté instalado en el servidor
 * (ver Dockerfile del proyecto).
 * @param {string} docxPath - ruta absoluta al .docx de entrada
 * @param {string} outDir - carpeta donde se debe generar el .pdf
 * @returns {Promise<string>} ruta absoluta al .pdf generado
 */
function convertToPdf(docxPath, outDir) {
  return new Promise((resolve, reject) => {
    const args = [
      "--headless",
      "--norestore",
      "--convert-to",
      "pdf",
      "--outdir",
      outDir,
      docxPath,
    ];

    execFile("soffice", args, { timeout: 60_000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new Error(
            `Fallo la conversión a PDF (¿está LibreOffice instalado?): ${error.message}\n${stderr}`
          )
        );
      }
      const base = path.basename(docxPath, path.extname(docxPath));
      const pdfPath = path.join(outDir, `${base}.pdf`);
      if (!fs.existsSync(pdfPath)) {
        return reject(new Error("LibreOffice no generó el archivo PDF esperado."));
      }
      resolve(pdfPath);
    });
  });
}

module.exports = { convertToPdf };
