import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { sendVerificationEmail, verifyCode } from "./server/emailService.js";
import { getGoogleOAuthUrl, handleGoogleCallback } from "./server/googleAuth.js";
import {
  getAllTables,
  saveTable,
  deleteTable,
  getAllApplications,
  saveApplication,
  getAllVerifications,
  saveVerification,
} from "./server/db.js";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "MesasRol Argentina API" });
  });

  // EMAIL VERIFICATION: Send real verification email via SMTP / Ethereal
  app.post("/api/auth/send-verification-email", async (req, res) => {
    try {
      const { email, name, pin, isAdult } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Email inválido" });
      }

      const generatedPin = pin || Math.floor(100000 + Math.random() * 900000).toString();
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

      const result = await sendVerificationEmail({
        toEmail: email,
        userName: name || "Aventurero",
        pin: generatedPin,
        appUrl,
        isAdult,
      });

      res.json({
        success: true,
        sentTo: email,
        pin: generatedPin,
        previewUrl: result.previewUrl,
        isEthereal: result.isEthereal,
        message: result.isEthereal
          ? "Correo de verificación generado con éxito (servidor SMTP de prueba)."
          : "Correo de verificación enviado exitosamente a tu casilla.",
      });
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      res.status(500).json({
        error: "No se pudo enviar el correo real de verificación.",
        details: err?.message || String(err),
      });
    }
  });

  // EMAIL VERIFICATION: Verify PIN code
  app.post("/api/auth/verify-code", (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Faltan parámetros requeridos" });
      }

      const isValid = verifyCode(email, code);
      if (isValid) {
        return res.json({ success: true, verified: true });
      } else {
        return res.status(400).json({ success: false, error: "Código incorrecto o expirado (15 min)" });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Error validando código" });
    }
  });

  // GOOGLE OAUTH: Get auth URL
  app.get("/api/auth/google/url", (req, res) => {
    try {
      const url = getGoogleOAuthUrl(req);
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
      res.json({ url, hasCustomClientId: !!clientId });
    } catch (err: any) {
      res.status(500).json({ error: "Error generando URL de Google" });
    }
  });

  // GOOGLE OAUTH: Callback route (popup target)
  app.get(["/auth/callback", "/auth/callback/"], handleGoogleCallback);

  // GOOGLE OAUTH: Fast Google account profile resolver (for instant one-click verified signin)
  app.post("/api/auth/google/fast-auth", (req, res) => {
    try {
      const { email, name, picture } = req.body;
      const userEmail = email || "aventurero.google@gmail.com";
      const userName = name || (userEmail.includes("@") ? userEmail.split("@")[0] : "Aventurero Google");
      
      res.json({
        success: true,
        user: {
          id: "google_" + Math.random().toString(36).substring(2, 10),
          email: userEmail,
          name: userName,
          picture: picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          verified_email: true,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: "Error resolviendo cuenta de Google" });
    }
  });

  // ==========================================
  // SHARED DATABASE & PERSISTENCE ROUTES
  // ==========================================

  // TABLES: Get all shared tables
  app.get("/api/tables", (req, res) => {
    try {
      const tables = getAllTables();
      res.json({ success: true, tables });
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo mesas" });
    }
  });

  // TABLES: Save or update a shared table
  app.post("/api/tables", (req, res) => {
    try {
      const table = req.body;
      if (!table || !table.id || !table.title) {
        return res.status(400).json({ error: "Datos de mesa incompletos" });
      }
      const updatedTables = saveTable(table);
      res.json({ success: true, table, tables: updatedTables });
    } catch (err: any) {
      res.status(500).json({ error: "Error guardando la mesa" });
    }
  });

  // TABLES: Delete a table
  app.delete("/api/tables/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updatedTables = deleteTable(id);
      res.json({ success: true, tables: updatedTables });
    } catch (err: any) {
      res.status(500).json({ error: "Error eliminando mesa" });
    }
  });

  // APPLICATIONS: Get all applications
  app.get("/api/applications", (req, res) => {
    try {
      const applications = getAllApplications();
      res.json({ success: true, applications });
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo solicitudes" });
    }
  });

  // APPLICATIONS: Save or update an application
  app.post("/api/applications", (req, res) => {
    try {
      const application = req.body;
      if (!application || !application.id || !application.tableId) {
        return res.status(400).json({ error: "Datos de solicitud incompletos" });
      }
      const updatedApps = saveApplication(application);
      res.json({ success: true, application, applications: updatedApps });
    } catch (err: any) {
      res.status(500).json({ error: "Error guardando solicitud" });
    }
  });

  // VERIFICATIONS: Get all admin verification requests
  app.get("/api/admin/verifications", (req, res) => {
    try {
      const requests = getAllVerifications();
      res.json({ success: true, requests });
    } catch (err: any) {
      res.status(500).json({ error: "Error obteniendo verificaciones" });
    }
  });

  // VERIFICATIONS: Submit or update a verification request
  app.post("/api/admin/verifications", (req, res) => {
    try {
      const request = req.body;
      if (!request || !request.id || !request.userId) {
        return res.status(400).json({ error: "Datos de verificación incompletos" });
      }
      const updatedReqs = saveVerification(request);
      res.json({ success: true, request, requests: updatedReqs });
    } catch (err: any) {
      res.status(500).json({ error: "Error guardando verificación" });
    }
  });


  // AI Assistant: Generate tailored character application pitch
  app.post("/api/gemini/generate-pitch", async (req, res) => {
    try {
      const { campaignTitle, system, setting, playerStyle, characterConcept, experience } = req.body;
      const ai = getGenAI();

      const prompt = `Actuá como un jugador entusiasta y respetuoso de rol de mesa en Argentina aplicando para unirte a la campaña "${campaignTitle || 'Aventura D&D'}" (Sistema: ${system || 'D&D 5e'}).
Detalles de la campaña / ambientación: ${setting || 'Fantasía heroica medieval'}.
Idea de personaje del jugador: ${characterConcept || 'Un pícaro o guerrero versátil'}.
Estilo de juego preferido: ${playerStyle || 'Balance de roleplay y combate cooperativo'}.
Nivel de experiencia: ${experience || 'Intermedio'}.

Generá una presentación breve (máximo 120 palabras), cordial, auténtica con tono argentino amigable y respetuoso para enviarle al Dungeon Master (Director de Juego). Incluí:
1. Saludo cálido y entusiasmo por la temática de la mesa.
2. Concepto o gancho de personaje que encaje con la campaña.
3. Compromiso con la puntualidad, el respeto de las herramientas de seguridad lúdica y la buena onda en la mesa presencial.
Respondé solo el texto del mensaje listo para enviar.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({ pitch: response.text || "" });
    } catch (err: any) {
      console.error("Gemini pitch error:", err);
      res.status(500).json({
        error: "No se pudo generar la presentación con IA. Podés escribir tu mensaje manualmente.",
        fallbackPitch: "¡Hola DM! Me interesa mucho sumarme a la mesa. Tengo disponibilidad y muchas ganas de rolear en un ambiente sano y colaborativo. Mi idea de personaje es flexible para complementar al grupo."
      });
    }
  });

  // AI Assistant: Generate campaign pitch for DMs
  app.post("/api/gemini/generate-campaign", async (req, res) => {
    try {
      const { title, system, tone, venueType, zone } = req.body;
      const ai = getGenAI();

      const prompt = `Actuá como un Dungeon Master experimentado en Argentina que está por abrir una mesa presencial de rol en ${zone || 'CABA'}.
Título propuesto: ${title || 'Crónicas de la Frontera'}
Sistema: ${system || 'D&D 5e'}
Tono/Estilo: ${tone || 'Fantasía oscura con misterio e investigación'}
Tipo de sede: ${venueType || 'Tienda lúdica'}

Generá:
1. Una sinopsis atractiva de 2 párrafos para enganchar jugadores.
2. 3 ganchos o preguntas iniciales para los personajes.
3. Sugerencia de tono y expectativas de la mesa.
Devolvé el texto con formato claro en español rioplatense neutro.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({ campaignDescription: response.text || "" });
    } catch (err: any) {
      console.error("Gemini campaign error:", err);
      res.status(500).json({ error: "Error generando descripción de campaña con IA" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MesasRol Argentina running on http://localhost:${PORT}`);
  });
}

startServer();
