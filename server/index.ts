import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/combine', async (req, res) => {
    try {
        const { toc1, toc2 } = req.body;

        if (!toc1 || !toc2) {
            return res.status(400).json({ error: 'Missing toc1 or toc2 in request body' });
        }

        const prompt = `
      You are a helpful assistant. 
      Combine the following two Tables of Contents (JSON) into a single coherent JSON Table of Contents.
      
      TOC 1:
      ${JSON.stringify(toc1)}
      
      TOC 2:
      ${JSON.stringify(toc2)}
      
      Return ONLY valid JSON format for the combined TOC. Do not add markdown formatting.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o', // or gpt-3.5-turbo if preferred
        });

        const content = completion.choices[0].message.content;

        // Attempt to parse JSON to ensure validity, or just return the text
        // The user asked for it to be displayed, so we return the JSON data.
        // If the LLM returns markdown code blocks, strip them.
        let jsonStr = content || '{}';
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        const combinedToc = JSON.parse(jsonStr);

        res.json({ combinedToc });
    } catch (error) {
        console.error('Error combining TOCs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/align-tocs', async (req, res) => {
    try {
        const { toc1, toc2 } = req.body;

        if (!toc1 || !toc2) {
            return res.status(400).json({ error: 'Missing toc1 or toc2 in request body' });
        }

        const prompt = `
      You are an expert AI assistant tasked with aligning two Tables of Contents (TOCs) semantically.
      
      Your Goal:
      Create a single ORDERED list of rows that aligns items from the Candidate TOC (TOC 2) against the Master TOC (TOC 1).
      
      Context:
      - TOC 1 (Master): The source of truth for the primary order. You must PRESERVE the relative order of TOC 1 items strictly.
      - TOC 2 (Candidate): Items to be aligned with TOC 1 or inserted where they fit contextually.
      
      Instructions:
      1. Analyze both TOC lists in their entirety to understand the global structure and context.
      2. Produce a JSON array of "AlignedRows".
      3. For each row, determine if it is:
         - A MATCH: TOC 1 item and TOC 2 item are semantically similar or identical.
         - LEFT ONLY: Use this for TOC 1 items that have no match in TOC 2.
         - RIGHT ONLY: Use this for TOC 2 items that have no match in TOC 1, inserting them in the list where they logically belong relative to TOC 1's flow.
      4. If you have a block of items from TOC 2 that insert between two TOC 1 items, keep them in their relative order from TOC 2.
      5. Provide a brief "reasoning" string for every row explaining the alignment decision (e.g. "Exact ID match", "Semantically similar introduction", "Unique topic in TOC 2 inserted after Section 1").
      
      Input Data:
      
      TOC 1 (Master):
      ${JSON.stringify(toc1)}
      
      TOC 2 (Candidate):
      ${JSON.stringify(toc2)}
      
      Output Format:
      Return ONLY a valid JSON object with a single key "alignedRows", which is an array of objects.
      Each object must look like:
      {
        "toc1Index": number | null, // The index of the item in valid TOC 1 array (0-based) or null
        "toc2Index": number | null, // The index of the item in valid TOC 2 array (0-based) or null
        "reasoning": string         // Brief explanation
      }
      
      Do not include markdown formatting.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o',
        });

        const content = completion.choices[0].message.content;
        let jsonStr = content || '{}';
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(jsonStr);

        res.json(result);
    } catch (error) {
        console.error('Error aligning TOCs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
