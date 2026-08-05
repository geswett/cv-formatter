const Anthropic = require("@anthropic-ai/sdk");
const { CV_TOOL_SCHEMA } = require("./schema");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

// Datos que Puelche NO quiere en el CV final. Se instruye explícitamente
// al modelo para que los descarte aunque estén presentes en el original.
const DATOS_A_DESCARTAR = [
  "fotografía / foto carnet",
  "dirección exacta (calle, número, departamento) — solo se conserva la ciudad/comuna",
  "RUT, DNI, cédula de identidad, pasaporte u otro número de documento",
  "fecha de nacimiento o edad",
  "estado civil",
  "nacionalidad (salvo que sea relevante para permisos de trabajo y el CV lo indique)",
  "género",
  "religión o afiliación política",
  "número de hijos / situación familiar",
  "referencias personales o laborales (nombres y teléfonos de contactos de referencia)",
  "pretensión de renta / expectativa salarial",
  "cualquier dato sensible no relacionado con la trayectoria profesional",
];

function buildSystemPrompt() {
  return `Sos un asistente de Puelche (consultora de reclutamiento) que reformatea CVs al estándar interno de la empresa.

Tu tarea: leer el texto crudo de un CV y devolver la información extraída y reordenada usando la herramienta "extraer_cv", lista para volcarse en la plantilla oficial de Puelche.

Reglas estrictas:
1. No inventes información. Todo dato debe poder rastrearse al texto original. Podés reformular redacción (ej. usar verbos de acción en las funciones), pero no agregar logros, empresas, fechas o títulos que no estén en el CV.
2. Descartá por completo los siguientes datos aunque estén presentes en el CV original: ${DATOS_A_DESCARTAR.join("; ")}.
3. La experiencia laboral va ordenada del cargo más reciente al más antiguo.
4. El resumen profesional debe tener máximo 5 líneas y seguir esta estructura: identidad profesional, nivel de cargos desempeñados, áreas de trabajo y rubros de experiencia, sello diferenciador.
5. En "cursos" incluí solo los cursos/certificaciones relevantes para el perfil profesional; si el CV lista cursos irrelevantes o genéricos, omitilos.
6. Si un dato no está presente en el CV, devolvé un string vacío ("") o array vacío ([]) para ese campo — nunca inventes un valor de relleno tipo "No especificado".
7. Mantené nombres propios (empresas, instituciones, personas) exactamente como aparecen en el original.`;
}

/**
 * Envía el texto del CV a Claude y devuelve el JSON estructurado según CV_TOOL_SCHEMA.
 * @param {string} cvText
 * @returns {Promise<object>}
 */
async function extractStructuredCv(cvText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable de entorno ANTHROPIC_API_KEY. Configurala antes de usar la herramienta."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    tools: [CV_TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "extraer_cv" },
    messages: [
      {
        role: "user",
        content: `Texto crudo extraído del CV:\n\n"""\n${cvText}\n"""`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    throw new Error("Claude no devolvió una extracción estructurada. Intentá de nuevo.");
  }

  return toolUse.input;
}

module.exports = { extractStructuredCv };
