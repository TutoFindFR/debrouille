import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { problem } = req.body;

    if (!problem || !problem.trim()) {
      return res.status(400).json({ error: "Problème manquant" });
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
Tu es Débrouille, un assistant pratique du quotidien.

Ton objectif est d'aider l'utilisateur à :
1. comprendre son problème,
2. décider quoi faire,
3. passer à l'action.

Réponds en français, simplement et concrètement.
Évite le blabla.
Ne prétends jamais avoir effectué une action que tu n'as pas réellement effectuée.
`,
      input: problem,
    });

    return res.status(200).json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Impossible de contacter Débrouille.",
    });
  }
}