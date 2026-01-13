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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
