// Esquema de datos del CV formateado, según la plantilla Puelche.
// Es el contrato entre la extracción con IA y la generación del documento.

const CV_TOOL_SCHEMA = {
  name: "extraer_cv",
  description:
    "Extrae y reordena la información de un CV al formato estándar de Puelche, descartando los datos irrelevantes.",
  input_schema: {
    type: "object",
    properties: {
      nombre_completo: {
        type: "string",
        description: "Nombre y apellido(s) de la persona, en mayúsculas.",
      },
      telefono: {
        type: "string",
        description: "Teléfono de contacto tal como aparece en el CV. Vacío si no está.",
      },
      email: {
        type: "string",
        description: "Correo electrónico de contacto. Vacío si no está.",
      },
      ciudad: {
        type: "string",
        description:
          "Solo ciudad/comuna de residencia, nunca la dirección exacta (calle, número, depto).",
      },
      linkedin: {
        type: "string",
        description: "URL completa del perfil de LinkedIn. Vacío si no está.",
      },
      resumen: {
        type: "string",
        description:
          "Resumen profesional de máximo 5 líneas: identidad profesional, nivel de cargos desempeñados, áreas/rubros de experiencia y sello diferenciador. Si el CV original ya trae un resumen o perfil, reescribilo en este formato usando solo información presente en el CV. Si no trae ninguno, construilo a partir de la experiencia listada. No inventes logros ni datos que no estén en el CV.",
      },
      experiencia: {
        type: "array",
        description: "Experiencia laboral, ordenada del cargo más reciente al más antiguo.",
        items: {
          type: "object",
          properties: {
            empresa: { type: "string" },
            anio_inicio: { type: "string", description: "Año de ingreso, ej. '2019'." },
            anio_fin: {
              type: "string",
              description: "Año de salida, o 'Actualidad' si el cargo es el actual.",
            },
            descripcion_empresa: {
              type: "string",
              description:
                "Descripción de la empresa en una sola línea (rubro/tamaño). Vacío si no hay info suficiente.",
            },
            cargo: { type: "string" },
            descripcion_funciones: {
              type: "string",
              description:
                "Funciones principales del cargo, redactadas con verbos de acción, en un párrafo breve.",
            },
            logros: {
              type: "array",
              items: { type: "string" },
              description:
                "Logros puntuales y cuantificables si el CV los menciona. Array vacío si no hay ninguno.",
            },
          },
          required: ["empresa", "cargo"],
        },
      },
      educacion: {
        type: "array",
        description: "Formación académica formal (título profesional, técnico, magíster, etc.).",
        items: {
          type: "object",
          properties: {
            titulo: {
              type: "string",
              description: "Título/profesión y si está titulado o egresado.",
            },
            institucion: { type: "string" },
            anio: { type: "string", description: "Año o rango de años, ej. '1995 - 2000'." },
          },
          required: ["titulo"],
        },
      },
      cursos: {
        type: "array",
        description:
          "Solo cursos o certificaciones relevantes para el perfil profesional (no listar todos si hay muchos irrelevantes).",
        items: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            institucion: { type: "string" },
            anio: { type: "string" },
          },
          required: ["nombre"],
        },
      },
      idiomas: {
        type: "string",
        description: "Idiomas y nivel, en una línea. Vacío si no se menciona.",
      },
      intereses: {
        type: "string",
        description: "Intereses relevantes, en una línea. Vacío si no se menciona.",
      },
      actividades_complementarias: {
        type: "string",
        description: "Actividades complementarias (voluntariados, deportes competitivos, etc). Vacío si no aplica.",
      },
    },
    required: ["nombre_completo", "resumen", "experiencia", "educacion", "cursos"],
  },
};

module.exports = { CV_TOOL_SCHEMA };
