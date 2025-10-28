import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Configuración para servir frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));

// 🔹 Ruta raíz para index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 🔹 Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "miauguau",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
  } else {
    console.log("✅ Conectado a MySQL correctamente");
  }
});

// --- Rutas API ---
app.get("/api/cats", (req, res) => {
  db.query("SELECT * FROM cats", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/cats", (req, res) => {
  const { name, age, breed, image, description, status } = req.body;
  db.query(
    "INSERT INTO cats (name, age, breed, image, description, status) VALUES (?, ?, ?, ?, ?, ?)",
    [name, age, breed, image, description, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

app.put("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query(
    "UPDATE cats SET status = ? WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Estado actualizado" });
    }
  );
});

app.delete("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM cats WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Gato eliminado" });
  });
});

// 🔹 Levantar servidor
app.listen(process.env.PORT || 4000, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 4000}`);
});
