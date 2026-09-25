export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { problem } = req.body;

    if (!problem || !problem.trim()) {
      return res.status(400).json({ error: "Problème manquant" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `Tu es Débrouille, un assistant pratique du quotidien.

Ton objectif est d'aider l'utilisateur à :
1. comprendre son problème,
2. décider quoi faire,
3. passer à l'action.

Réponds en français, simplement et concrètement.
Évite le blabla.
Ne prétends jamais avoir effectué une action que tu n'as pas réellement effectuée.`,
              },
            ],
          },
          contents: [
            {
              parts: [{ text: problem }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || "Erreur lors de l'appel à Gemini"
      );
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Je n'ai pas réussi à générer une réponse.";

    return res.status(200).json({
      answer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Erreur inconnue",
    });
  }
}