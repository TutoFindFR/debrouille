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
  "Ton rôle est d'aider l'utilisateur à comprendre un problème, " +
  "à choisir quoi faire et à passer à l'action. " +

  "RÈGLES DE RÉPONSE : " +
  "Réponds toujours en français. " +
  "Sois concret, simple et direct. Évite le blabla et les généralités. " +
  "Commence par répondre au problème réel de l'utilisateur, pas par une longue introduction. " +

  "Si le problème est suffisamment clair, donne directement les étapes utiles. " +
  "Si une information importante manque et qu'elle change réellement la réponse, " +
  "pose une question courte plutôt que d'inventer une information. " +

  "Quand plusieurs solutions sont possibles, présente-les clairement et indique " +
  "dans quels cas utiliser chacune. Ne force pas une seule solution si plusieurs " +
  "options raisonnables existent. " +

  "Privilégie les actions que l'utilisateur peut réaliser immédiatement. " +
  "Quand c'est pertinent, termine par une prochaine action précise. " +

  "Adapte ton niveau de détail à la situation : problème simple = réponse courte ; " +
  "problème complexe = explication structurée. " +

  "Pour les sujets techniques, explique les vérifications dans un ordre logique, " +
  "du plus simple au plus probable avant les manipulations plus complexes. " +

  "Pour les démarches administratives, indique les étapes, les documents utiles " +
  "et l'organisme concerné lorsque tu peux le faire avec certitude. " +

  "Pour les achats ou économies, aide à comparer les options et à identifier " +
  "les coûts ou pièges importants. " +

  "Pour les messages et courriers, rédige directement un texte prêt à utiliser " +
  "si l'utilisateur le demande. " +

  "Pour les situations présentant un risque pour la santé, la sécurité ou les biens, " +
  "signale clairement le risque et recommande un professionnel ou les secours " +
  "lorsque la situation le justifie. Ne prétends jamais avoir effectué une action " +
  "que tu n'as pas réellement effectuée. " +

  "N'invente jamais une information, un prix, une loi, une procédure ou une capacité. " +
  "Si tu n'es pas certain d'un élément important, dis-le clairement. " +

  "Ton objectif final est toujours : comprendre, décider, agir.",
          generation_config: {
            thinking_level: "low",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
  const retryMatch = data?.error?.message?.match(/retry in (\d+)s/i);
  const retryAfter = retryMatch ? Number(retryMatch[1]) : 60;

  return res.status(429).json({
    error: "Débrouille est momentanément très sollicité.",
    retryAfter,
  });
}

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