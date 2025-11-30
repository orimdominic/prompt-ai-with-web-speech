import http from "node:http";
import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(JSON.parse(data)));
    req.on("error", reject);
  });
}

const server = http.createServer(async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  switch (req.method) {
    case "POST": {
      const body = await getRequestBody(req);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: body.prompt,
      });
      return res.end(response.text);
    }

    default: {
      return res.end("non-post request received");
    }
  }
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, function () {
  console.log(`server running on port ${port}`);
});
