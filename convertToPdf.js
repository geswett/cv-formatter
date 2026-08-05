const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopType,
  ExternalHyperlink,
  UnderlineType,
} = require("docx");

// Medidas tomadas de la plantilla original Formato_CV.docx (en twips / DXA)
const PAGE = { width: 12240, height: 15840 }; // Carta (Letter)
const MARGINS = { top: 1134, right: 1320, bottom: 280, left: 1280 };
const RIGHT_TAB_POS = PAGE.width - MARGINS.left - MARGINS.right; // 9640
const GRAY = "A6A6A6";

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: GRAY, space: 4 },
    },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24 })],
  });
}

function emptyLine() {
  return new Paragraph({ text: "" });
}

function contactLine(parts) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: parts
      .filter(Boolean)
      .map((p, i, arr) =>
        i === arr.length - 1
          ? new TextRun({ text: p, size: 20 })
          : new TextRun({ text: `${p}   |   `, size: 20 })
      ),
  });
}

function linkedinLine(url) {
  if (!url) return null;
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: url,
            size: 20,
            color: "0563C1",
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      }),
    ],
  });
}

function experienceBlock(job) {
  const children = [];

  const dateRange = [job.anio_inicio, job.anio_fin].filter(Boolean).join(" – ");

  children.push(
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB_POS }],
      spacing: { before: 200 },
      children: [
        new TextRun({ text: job.empresa || "", bold: true, size: 22 }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: dateRange, bold: true, size: 22 }),
      ],
    })
  );

  if (job.descripcion_empresa) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: job.descripcion_empresa, italics: true, size: 22 })],
      })
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 100 },
      children: [new TextRun({ text: job.cargo || "", bold: true, size: 22 })],
    })
  );

  if (job.descripcion_funciones) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: job.descripcion_funciones, size: 22 })],
      })
    );
  }

  (job.logros || []).forEach((logro) => {
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: logro, size: 22 })],
      })
    );
  });

  return children;
}

function tableLikeEntry(leftText, rightText) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB_POS }],
    children: [
      new TextRun({ text: leftText, size: 22 }),
      new TextRun({ text: "\t" }),
      new TextRun({ text: rightText || "", bold: true, size: 22 }),
    ],
  });
}

function infoLine(label, value) {
  if (!value) return null;
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: value, size: 22 }),
    ],
  });
}

/**
 * Construye el documento .docx final a partir de los datos estructurados del CV.
 * @param {object} data - objeto que cumple con CV_TOOL_SCHEMA
 * @returns {Promise<Buffer>}
 */
async function buildDocx(data) {
  const children = [];

  // --- Encabezado ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40 },
      children: [
        new TextRun({ text: (data.nombre_completo || "").toUpperCase(), bold: true, size: 28 }),
      ],
    })
  );
  children.push(contactLine([data.telefono, data.email]));
  if (data.ciudad) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: data.ciudad, size: 20 })],
      })
    );
  }
  const linkedin = linkedinLine(data.linkedin);
  if (linkedin) children.push(linkedin);

  children.push(emptyLine());

  // --- Resumen ---
  children.push(sectionHeader("Resumen"));
  children.push(new Paragraph({ children: [new TextRun({ text: data.resumen || "", size: 22 })] }));
  children.push(emptyLine());

  // --- Experiencia profesional ---
  if ((data.experiencia || []).length > 0) {
    children.push(sectionHeader("Experiencia profesional"));
    data.experiencia.forEach((job) => {
      children.push(...experienceBlock(job));
    });
    children.push(emptyLine());
  }

  // --- Antecedentes académicos ---
  if ((data.educacion || []).length > 0) {
    children.push(sectionHeader("Antecedentes académicos"));
    data.educacion.forEach((edu) => {
      const left = [edu.titulo, edu.institucion].filter(Boolean).join(", ");
      children.push(tableLikeEntry(left, edu.anio));
    });
    children.push(emptyLine());
  }

  // --- Cursos y certificaciones ---
  if ((data.cursos || []).length > 0) {
    children.push(sectionHeader("Cursos y certificaciones"));
    data.cursos.forEach((curso) => {
      const left = [curso.nombre, curso.institucion].filter(Boolean).join(", ");
      children.push(tableLikeEntry(left, curso.anio));
    });
    children.push(emptyLine());
  }

  // --- Información adicional ---
  const infoLines = [
    infoLine("Idiomas", data.idiomas),
    infoLine("Intereses", data.intereses),
    infoLine("Actividades complementarias", data.actividades_complementarias),
  ].filter(Boolean);

  if (infoLines.length > 0) {
    children.push(sectionHeader("Información adicional"));
    children.push(...infoLines);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: MARGINS,
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
  });

  return Packer.toBuffer(doc);
}

module.exports = { buildDocx };
