import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Clause Test API is running" });
  });

  // Mock endpoint for file "processing" (actual AI logic will be on frontend)
  app.post("/api/upload", (req, res) => {
    // In a real app, we'd handle multiparts/files here
    res.json({ success: true, message: "Files received for analysis" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
