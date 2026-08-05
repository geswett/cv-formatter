require("dotenv").config();
const express = require("express");
const path = require("path");
const processRouter = require("./routes/process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api", processRouter);

app.listen(PORT, () => {
  console.log(`CV Formatter escuchando en http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "ATENCIÓN: no se encontró ANTHROPIC_API_KEY en el entorno. Configurala en un archivo .env (ver .env.example)."
    );
  }
});
