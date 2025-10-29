import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Carpeta de uploads
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Servir frontend y uploads
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(UPLOAD_DIR));

// Conexión MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "miauguau",
});

db.connect((err) => {
  if (err) console.error("Error al conectar a MySQL:", err.message);
  else console.log("✅ Conectado a MySQL correctamente");
});

// --- Rutas ---
app.get("/api/cats", (req, res) => {
  db.query("SELECT * FROM cats", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Subir gato con imagen
app.post("/api/cats", upload.single("imageFile"), (req, res) => {
  const { name, age, breed, description, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

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
  db.query("UPDATE cats SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Estado actualizado" });
  });
});

app.delete("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM cats WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Gato eliminado" });
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 5000}`);
});
