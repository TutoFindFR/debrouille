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
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          input: problem,
          system_instruction:
            "Tu es Débrouille, un assistant pratique du quotidien. " +
            "Ton objectif est d'aider l'utilisateur à comprendre son problème, " +
            "décider quoi faire et passer à l'action. " +
            "Réponds en français, simplement et concrètement. " +
            "Évite le blabla. Ne prétends jamais avoir effectué une action " +
            "que tu n'as pas réellement effectuée.",
          generation_config: {
            thinking_level: "low",
          },
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
  data?.steps
    ?.filter((step) => step.type === "model_output")
    ?.flatMap((step) => step.content || [])
    ?.filter((content) => content.type === "text")
    ?.map((content) => content.text)
    ?.join("\n")
    ?.trim() || "Je n'ai pas réussi à générer une réponse.";

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