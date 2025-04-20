// server.js
require('dotenv').config();
console.log('✅ GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Configuration ---
const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATA_FILE = path.join(__dirname, 'analysis.json');

// Fail fast if the Gemini key is missing
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
  process.exit(1);
}

// --- Initialize App and Middleware ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Persistent Storage ---
let analysisStore = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    analysisStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log('✅ Loaded analysis from disk');
  }
} catch (err) {
  console.error('Failed to load analysis from disk:', err);
  analysisStore = {};
}

function saveAnalysisToFile() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(analysisStore, null, 2));
}

// --- Initialize Google Gemini AI Client ---
let model;
try {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('✅ Google Generative AI initialized.');
} catch (initError) {
  console.error('\nERROR initializing Google Generative AI:', initError.message);
  process.exit(1);
}

// --- Helper Functions ---
async function analyzeAddress(address) {
  console.log(`Analyzing address: ${address}`);
  await new Promise(r => setTimeout(r, 50)); // simulate delay
  let riskScore = Math.floor(Math.random() * 30);
  const flags = [];

  if (address.toLowerCase() === '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef') {
    riskScore = 95;
    flags.push('Known Burn Address');
  } else if (address && address.length === 42 && Math.random() > 0.9) {
    riskScore = Math.max(riskScore, 70);
    flags.push('Placeholder High Risk Flag');
  }

  return { address, riskScore, flags, provider: 'Placeholder Analysis Inc.' };
}

async function analyzeDescription(description) {
  console.log('Attempting description analysis with Gemini...');
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
Analyze the funding request description for clarity, apparent legitimacy (based only on text), sentiment, and potential red flags.
Description: "${description}"
Output ONLY the JSON object below with your analysis:
{
  "summary": "string",
  "clarity_score": number (0-100),
  "legitimacy_score": number (0-100),
  "sentiment": "Positive" | "Neutral" | "Negative",
  "flags": ["string array of potential flags"]
}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('Valid JSON object not found in response.');
    }
    const jsonString = text.substring(start, end + 1);
    const parsed = JSON.parse(jsonString);

    if (
      typeof parsed.summary !== 'string' ||
      typeof parsed.clarity_score !== 'number' ||
      typeof parsed.legitimacy_score !== 'number' ||
      !['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment) ||
      !Array.isArray(parsed.flags)
    ) {
      throw new Error('Parsed JSON missing required fields.');
    }
    return parsed;
  } catch (err) {
    console.error('Error during description analysis with Gemini:', err.message);
    return {
      summary: `Error analyzing description: ${err.message}`,
      clarity_score: 0,
      legitimacy_score: 0,
      sentiment: 'Neutral',
      flags: ['AI API/Parsing Error'],
    };
  }
}

// --- Routes ---

app.post('/analyze-proposal', async (req, res) => {
  const { recipientAddress, description, evidenceCID, proposalId } = req.body;
  console.log(`Received trigger for analysis. CID: ${evidenceCID || 'N/A'}`);

  const pid = proposalId ?? `${recipientAddress}-${Date.now()}`;

  if (!recipientAddress || !description) {
    return res.status(400).json({ success: false, error: 'Missing recipientAddress or description.' });
  }

  if (analysisStore[pid]) {
    console.log(`🛑 Skipping duplicate analysis for proposal ${pid}`);
    return res.status(200).json({ success: true, message: 'Already analyzed.', data: analysisStore[pid] });
  }

  try {
    const [addressAnalysis, descriptionAnalysis] = await Promise.all([
      analyzeAddress(recipientAddress),
      analyzeDescription(description)
    ]);

    const finalResult = {
      proposalId: pid,
      recipientAddress,
      description,
      evidenceCID,
      analysisTimestamp: new Date().toISOString(),
      addressAnalysis,
      descriptionAnalysis,
    };

    analysisStore[pid] = finalResult;
    saveAnalysisToFile();
    console.log(`Auto-stored analysis for proposal ${pid}`);
    return res.status(200).json({ success: true, message: 'Analysis complete and stored automatically.', data: finalResult });
  } catch (err) {
    console.error(`Auto-analysis failed:`, err);
    return res.status(500).json({ success: false, error: 'Failed to analyze proposal automatically.' });
  }
});

app.post('/finalize-analysis/:proposalId', async (req, res) => {
  const proposalId = req.params.proposalId;
  const { recipientAddress, description, evidenceCID } = req.body;

  if (!recipientAddress || !description) {
    return res.status(400).json({ success: false, error: 'Missing recipientAddress or description.' });
  }

  if (analysisStore[proposalId]) {
    console.log(`🛑 Skipping duplicate analysis for proposal ${proposalId}`);
    return res.status(200).json({ success: true, message: 'Already analyzed.', data: analysisStore[proposalId] });
  }

  try {
    console.log(`Running final analysis for ID: ${proposalId}`);
    const [addressAnalysis, descriptionAnalysis] = await Promise.all([
      analyzeAddress(recipientAddress),
      analyzeDescription(description),
    ]);

    const finalResult = {
      proposalId,
      recipientAddress,
      description,
      evidenceCID,
      analysisTimestamp: new Date().toISOString(),
      addressAnalysis,
      descriptionAnalysis,
    };

    analysisStore[proposalId] = finalResult;
    saveAnalysisToFile();

    console.log(`Stored analysis for ${proposalId}`);
    res.json({ success: true, message: `Analysis stored for proposal ${proposalId}`, data: finalResult });
  } catch (error) {
    console.error(`Error finalizing analysis for ${proposalId}:`, error.message);
    analysisStore[proposalId] = { error: error.message };
    res.status(500).json({ success: false, error: 'Internal error finalizing analysis.' });
  }
});

app.get('/proposal-analysis/:proposalId', (req, res) => {
  const proposalId = req.params.proposalId;
  console.log(`Fetching analysis for ID: ${proposalId}`);

  const result = analysisStore[proposalId];
  if (!result) {
    return res.status(404).json({ error: `Analysis not found for proposal ID ${proposalId}` });
  }
  res.json(result);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
