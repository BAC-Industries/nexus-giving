// server.js
require('dotenv').config();  
console.log('✅ GEMINI_API_KEY=', process.env.GEMINI_API_KEY);

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const PORT = process.env.PORT || 3001;

// Fail fast if the key is missing
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error(
    'ERROR: GEMINI_API_KEY is undefined. ' +
    'Please set process.env.GEMINI_API_KEY (or use a .env file).'
  );
  process.exit(1);
}

// --- Initialize App and Middleware ---
const app = express();
app.use(cors());
app.use(express.json());

// --- In‑Memory Storage (for demo purposes) ---
const analysisStore = {};

// --- Initialize Google Gemini AI ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- Helper Functions ---
async function analyzeAddress(address) {
  console.log(`Analyzing address: ${address}`);
  await new Promise(r => setTimeout(r, 50));

  let riskScore = Math.floor(Math.random() * 30);
  const flags = [];

  if (address.toLowerCase() === '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef') {
    riskScore = 95;
    flags.push('Known Burn Address');
  } else if (Math.random() > 0.9) {
    riskScore = 70;
    flags.push('Interacted with high-risk entities');
  }

  return { address, riskScore, flags, provider: 'Placeholder Analysis' };
}

async function analyzeDescription(description) {
  console.log('Analyzing description with Gemini…');

  if (!description || !description.trim()) {
    return {
      summary: 'No description provided.',
      clarity_score: 0,
      legitimacy_score: 0,
      sentiment: 'Neutral',
      flags: ['Missing Description'],
    };
  }

  const prompt = `
Analyze the following funding request description. Identify red flags, assess clarity and legitimacy based *only* on the text.

Description: "${description}"

Return strictly in JSON:
{
  "summary": "…",
  "clarity_score": 0–100,
  "legitimacy_score": 0–100,
  "sentiment": "Positive"|"Neutral"|"Negative",
  "flags": ["…"]
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Raw Gemini response:', text);

    // Strip markdown fences if present
    let jsonString = text.trim()
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(jsonString);

    if (
      typeof parsed.summary === 'string' &&
      typeof parsed.clarity_score === 'number' &&
      typeof parsed.legitimacy_score === 'number' &&
      typeof parsed.sentiment === 'string' &&
      Array.isArray(parsed.flags)
    ) {
      return parsed;
    } else {
      return {
        summary: parsed.summary || 'Unexpected format from AI.',
        clarity_score: 0,
        legitimacy_score: 0,
        sentiment: 'Neutral',
        flags: ['AI Result Format Error'],
      };
    }
  } catch (e) {
    console.error('Error during description analysis:', e);
    return {
      summary: `Error analyzing description: ${e.message}`,
      clarity_score: 0,
      legitimacy_score: 0,
      sentiment: 'Neutral',
      flags: ['AI API Error'],
    };
  }
}

// --- Routes ---

// POST /analyze-proposal
app.post('/analyze-proposal', async (req, res) => {
  const { recipientAddress, description, evidenceCID, proposalId: providedId } = req.body;

  if (!recipientAddress || !description) {
    return res.status(400).json({ error: 'Missing recipientAddress or description' });
  }

  const proposalId = providedId || `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  try {
    const [addressAnalysis, descriptionAnalysis] = await Promise.all([
      analyzeAddress(recipientAddress),
      analyzeDescription(description),
    ]);

    const fullResult = {
      proposalId,
      recipientAddress,
      description,
      evidenceCID: evidenceCID || null,
      analysisTimestamp: new Date().toISOString(),
      addressAnalysis,
      descriptionAnalysis,
    };

    analysisStore[proposalId] = fullResult;
    console.log(`Analysis complete for proposal ${proposalId}`);

    res.status(200).json({ success: true, proposalId, message: 'Analysis complete.' });
  } catch (err) {
    console.error(`Error during analysis for proposal ${proposalId}:`, err);
    res.status(500).json({ success: false, error: 'Internal error during analysis.' });
  }
});

// GET /proposal-analysis/:proposalId
app.get('/proposal-analysis/:proposalId', (req, res) => {
  const result = analysisStore[req.params.proposalId];
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ error: 'Analysis not found or not ready.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
