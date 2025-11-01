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

// Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// 🐱 Conexión MySQL (Render usa variables de entorno si querés conectar una DB externa)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "miauguau",
});

let dbConnected = false;

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
    dbConnected = false;
  } else {
    console.log("✅ Conectado a MySQL correctamente");
    dbConnected = true;
  }
});

// --- Rutas API (deben ir ANTES de los archivos estáticos) ---
// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    database: dbConnected ? "connected" : "disconnected",
    message: dbConnected ? "Base de datos conectada" : "Base de datos desconectada"
  });
});

app.get("/api/cats", (req, res) => {
  db.query("SELECT * FROM cats", (err, result) => {
    if (err) {
      console.error("❌ Error en GET /api/cats:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`✅ GET /api/cats - Retornando ${result.length} gatos`);
    res.json(result);
  });
});

app.post("/api/cats", upload.single("imageFile"), (req, res) => {
  const { name, age, breed, description, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";

  console.log("📝 POST /api/cats - Nuevo gato:", { name, age, breed, status });

  db.query(
    "INSERT INTO cats (name, age, breed, image, description, status) VALUES (?, ?, ?, ?, ?, ?)",
    [name, age, breed, image, description, status],
    (err, result) => {
      if (err) {
        console.error("❌ Error en POST /api/cats:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("✅ POST /api/cats - Gato creado con ID:", result.insertId);
      res.json({ id: result.insertId });
    }
  );
});

app.put("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`🔄 PUT /api/cats/${id} - Cambiando estado a: ${status}`);
  db.query("UPDATE cats SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) {
      console.error(`❌ Error en PUT /api/cats/${id}:`, err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Estado actualizado" });
  });
});

app.delete("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/cats/${id}`);
  db.query("DELETE FROM cats WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(`❌ Error en DELETE /api/cats/${id}:`, err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Gato eliminado" });
  });
});

// Servir frontend y uploads (DESPUÉS de las rutas API)
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});

// 🚀 Iniciar servidor (Railway asigna el puerto automáticamente)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
