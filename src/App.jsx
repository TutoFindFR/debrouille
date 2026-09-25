import { useRef, useState } from "react";
import "./App.css";

const examples = [
  "J'ai reçu une facture que je ne comprends pas...",
  "Je dois répondre à ce message sans m'énerver...",
  "Je dois faire une démarche administrative...",
  "Je veux trouver une solution moins chère...",
];

function getActionContent(action, problem) {
  const lower = problem.toLowerCase();

  if (action === "explain") {
    if (
      lower.includes("facture") ||
      lower.includes("prix") ||
      lower.includes("payer")
    ) {
      return {
        title: "Je t'explique ce qu'il faut regarder.",
        text: "Sans voir la facture, je ne vais pas inventer ce que signifient les montants. En revanche, voici exactement comment la décortiquer.",
        points: [
          "Le montant total à payer",
          "La période facturée",
          "La consommation ou le service facturé",
          "Les abonnements et frais fixes",
          "Les taxes et éventuels frais supplémentaires",
        ],
      };
    }

    if (
      lower.includes("message") ||
      lower.includes("répondre") ||
      lower.includes("repondre") ||
      lower.includes("sms")
    ) {
      return {
        title: "Le plus important est ce que tu veux obtenir.",
        text: "Avant de répondre, on sépare le problème de l'émotion. Le but est d'envoyer un message clair qui défend ton point de vue sans créer un conflit inutile.",
        points: [
          "Définir ce que tu veux obtenir",
          "Garder uniquement les faits importants",
          "Supprimer les phrases qui pourraient envenimer la situation",
          "Terminer par une demande claire",
        ],
      };
    }

    return {
      title: "On va découper ton problème.",
      text: "Un problème paraît souvent compliqué parce que tout arrive en même temps. Débrouille peut le transformer en petites actions simples.",
      points: [
        "Définir le problème réel",
        "Séparer les faits des suppositions",
        "Identifier ce qui dépend de toi",
        "Faire la première action utile",
      ],
    };
  }

  if (action === "write") {
    if (
      lower.includes("facture") ||
      lower.includes("prix") ||
      lower.includes("payer")
    ) {
      return {
        title: "Voici un message que tu peux envoyer.",
        draft:
          "Bonjour,\n\nJe vous contacte concernant ma facture. Je souhaiterais comprendre précisément l'origine du montant demandé et savoir s'il y a eu une modification par rapport à ma facturation habituelle.\n\nPouvez-vous m'indiquer le détail des éléments qui composent cette facture et, le cas échéant, l'origine de cette évolution ?\n\nMerci par avance pour votre retour.\n\nCordialement",
      };
    }

    if (
      lower.includes("message") ||
      lower.includes("répondre") ||
      lower.includes("repondre") ||
      lower.includes("sms")
    ) {
      return {
        title: "Une réponse calme et directe.",
        draft:
          "Je préfère qu'on en parle calmement. Ce qui me pose problème, c'est surtout la situation actuelle. Je veux simplement qu'on puisse se comprendre et trouver une solution qui convienne à chacun.",
      };
    }

    return {
      title: "On peut partir sur cette base.",
      draft:
        "Bonjour,\n\nJe vous contacte afin d'obtenir des informations concernant ma situation. Pouvez-vous m'indiquer les démarches à suivre et les éléments dont vous avez besoin de mon côté ?\n\nMerci pour votre retour.\n\nCordialement",
    };
  }

  if (action === "remind") {
    return {
      title: "Ne laisse pas ce problème disparaître dans un coin.",
      text: "Pour la bêta, Débrouille peut déjà préparer ton rappel. Les vraies notifications seront ajoutées plus tard.",
      reminders: ["Demain", "Dans 3 jours", "Dans 7 jours"],
    };
  }

  if (action === "verify") {
    if (
      lower.includes("facture") ||
      lower.includes("prix") ||
      lower.includes("payer")
    ) {
      return {
        title: "Voici ce qu'on vérifiera.",
        text: "Pour vérifier réellement ta facture, il faudra me donner le document. Pour l'instant, voici la checklist.",
        points: [
          "Le montant total correspond-il aux lignes détaillées ?",
          "La période facturée est-elle correcte ?",
          "La consommation a-t-elle changé ?",
          "Le tarif ou l'abonnement a-t-il évolué ?",
          "Y a-t-il des frais inhabituels ?",
        ],
      };
    }

    return {
      title: "On va chercher ce qui mérite d'être vérifié.",
      text: "Une bonne vérification consiste à confronter les informations disponibles avec des éléments concrets.",
      points: [
        "Vérifier les informations de départ",
        "Chercher les éléments manquants",
        "Comparer avec une source fiable",
        "Identifier ce qui est certain et ce qui reste à confirmer",
      ],
    };
  }

  return null;
}

function App() {
  const [problem, setProblem] = useState("");
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("home");

  const [activeAction, setActiveAction] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedReminder, setSavedReminder] = useState(null);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Choisis une image.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setImage({
      url: imageUrl,
      name: file.name,
    });

    event.target.value = "";
  };

  const removeImage = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }

    setImage(null);
  };

  const handleSubmit = async () => {
  if (!problem.trim() && !image) return;

  const today = new Date().toISOString().slice(0, 10);
  const quotaKey = "debrouille_ai_quota";

  const savedQuota = JSON.parse(
    localStorage.getItem(quotaKey) || '{"date":"","count":0}'
  );

  if (savedQuota.date !== today) {
    savedQuota.date = today;
    savedQuota.count = 0;
  }

  if (savedQuota.count >= 5) {
    setResponse({
      title: "Tu as utilisé tes 5 coups de main.",
      intro:
        "La limite gratuite de la bêta est atteinte pour aujourd'hui. Reviens demain pour continuer à utiliser Débrouille.",
      steps: [
        "Le quota revient demain",
        "Tes conversations restent accessibles",
        "Débrouille continue d'évoluer",
      ],
    });

    setActiveAction(null);
    setSavedReminder(null);
    setCopied(false);
    return;
  }

  const historyText =
    problem.trim() || "Problème envoyé avec une image";

  setActiveAction(null);
  setSavedReminder(null);
  setCopied(false);
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problem: historyText,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erreur serveur");
    }

    savedQuota.count += 1;
    localStorage.setItem(quotaKey, JSON.stringify(savedQuota));

    setResponse({
      title: "J'ai compris ton problème.",
      intro: data.answer,
      steps: [
        "Comprendre la situation",
        "Identifier les options possibles",
        "Passer à l'action",
      ],
    });

    const newItem = {
      id: Date.now(),
      text: historyText,
      date: new Date().toLocaleDateString("fr-FR"),
      answer: data.answer,
    };

    setHistory((current) => [newItem, ...current].slice(0, 20));
  } catch (error) {
    console.error(error);

    setResponse({
      title: "Débrouille rencontre un problème.",
      intro: error.message || "Erreur inconnue",
      steps: [
        "Vérifier la connexion au serveur",
        "Réessayer",
        "Vérifier la configuration si le problème continue",
      ],
    });
  } finally {
    setLoading(false);
  }
};

  const handleExample = (example) => {
    setProblem(example);
  };

  const handleAction = (action) => {
    setActiveAction(action);
    setCopied(false);
    setSavedReminder(null);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReminder = (choice) => {
    setSavedReminder(choice);
  };

  const reset = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }

    setProblem("");
    setResponse(null);
    setActiveAction(null);
    setCopied(false);
    setSavedReminder(null);
    setImage(null);
    setActiveTab("home");
  };

  const actionContent = activeAction
    ? getActionContent(activeAction, problem)
    : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={reset}>
          <span className="brand-mark">D</span>
          <span>DÉBROUILLE</span>
        </button>

        <div className="topbar-status">
          <span className="status-dot"></span>
          Bêta
        </div>
      </header>

      <main className="main-content">
        {activeTab === "home" && (
          <>
            {!response ? (
              <section className="hero">
                <div className="hero-badge">
                  <span>✦</span> Ton assistant du quotidien
                </div>

                <h1>
                  T'as un problème ?
                  <br />
                  <span>Balance.</span>
                </h1>

                <p className="hero-subtitle">
                  Débrouille t'aide à comprendre, décider et agir.
                  <br />
                  Pas besoin de savoir par où commencer.
                </p>

                <div className="problem-card">
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Écris ce qui t'embête..."
                    rows="5"
                  />

                  {image && (
                    <div className="image-preview">
                      <img src={image.url} alt="Problème ajouté" />

                      <div className="image-preview-info">
                        <span>{image.name}</span>

                        <button
                          type="button"
                          onClick={removeImage}
                          title="Supprimer l'image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    style={{ display: "none" }}
                  />

                  <div className="input-tools">
                    <button
                      className="tool-button"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span>＋</span>
                      Ajouter une photo
                    </button>
                  </div>

                  <button
                    className="debrouille-button"
                    onClick={handleSubmit}
                    disabled={loading || (!problem.trim() && !image)}
                  >
                    <span>
                      {loading ? "Débrouille réfléchit…" : "Débrouille-moi ça"}
                    </span>
                    <span className="button-arrow">→</span>
                  </button>
                </div>

                <div className="examples">
                  <span className="examples-title">Tu peux essayer :</span>

                  <div className="example-list">
                    {examples.map((example) => (
                      <button
                        key={example}
                        className="example-chip"
                        onClick={() => handleExample(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <section className="result-section">
                <button className="back-button" onClick={reset}>
                  ← Nouveau problème
                </button>

                <div className="result-header">
                  <div className="result-icon">✓</div>

                  <div>
                    <span className="eyebrow">
                      DÉBROUILLE A COMPRIS
                    </span>
                    <h2>{response.title}</h2>
                  </div>
                </div>

                {image && (
                  <div className="submitted-image">
                    <img src={image.url} alt="Document envoyé" />
                    <span>Image jointe au problème</span>
                  </div>
                )}

                <div className="result-card">
                  <p className="result-intro">{response.intro}</p>

                  <div className="steps">
                    {response.steps.map((step, index) => (
                      <div className="step" key={step}>
                        <div className="step-number">{index + 1}</div>

                        <div>
                          <strong>{step}</strong>
                          <p>
                            Débrouille pourra t'accompagner sur cette étape.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="actions-title">Qu'est-ce qu'on fait ?</div>

                <div className="action-grid">
                  <button
                    className={
                      activeAction === "explain"
                        ? "action-card selected"
                        : "action-card"
                    }
                    onClick={() => handleAction("explain")}
                  >
                    <span className="action-icon">◈</span>
                    <strong>Expliquer</strong>
                    <small>Je veux comprendre</small>
                  </button>

                  <button
                    className={
                      activeAction === "write"
                        ? "action-card selected"
                        : "action-card"
                    }
                    onClick={() => handleAction("write")}
                  >
                    <span className="action-icon">✎</span>
                    <strong>Rédiger</strong>
                    <small>Préparer un message</small>
                  </button>

                  <button
                    className={
                      activeAction === "remind"
                        ? "action-card selected"
                        : "action-card"
                    }
                    onClick={() => handleAction("remind")}
                  >
                    <span className="action-icon">◷</span>
                    <strong>Rappeler</strong>
                    <small>Ne pas oublier</small>
                  </button>

                  <button
                    className={
                      activeAction === "verify"
                        ? "action-card selected"
                        : "action-card"
                    }
                    onClick={() => handleAction("verify")}
                  >
                    <span className="action-icon">⌕</span>
                    <strong>Vérifier</strong>
                    <small>Aller plus loin</small>
                  </button>
                </div>

                {actionContent && (
                  <div className="action-result">
                    <div className="action-result-top">
                      <span className="eyebrow">DÉBROUILLE</span>

                      <button
                        className="close-action"
                        onClick={() => setActiveAction(null)}
                      >
                        ×
                      </button>
                    </div>

                    <h3>{actionContent.title}</h3>

                    {actionContent.text && (
                      <p className="action-result-text">
                        {actionContent.text}
                      </p>
                    )}

                    {actionContent.points && (
                      <div className="action-points">
                        {actionContent.points.map((point, index) => (
                          <div className="action-point" key={point}>
                            <span>{index + 1}</span>
                            <p>{point}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {actionContent.draft && (
                      <div className="draft-box">
                        <div className="draft-header">
                          <span>MESSAGE PROPOSÉ</span>

                          <button
                            className="copy-button"
                            onClick={() =>
                              handleCopy(actionContent.draft)
                            }
                          >
                            {copied ? "✓ Copié" : "Copier"}
                          </button>
                        </div>

                        <p>{actionContent.draft}</p>
                      </div>
                    )}

                    {actionContent.reminders && (
                      <div className="reminder-options">
                        {actionContent.reminders.map((reminder) => (
                          <button
                            key={reminder}
                            className={
                              savedReminder === reminder
                                ? "reminder-button saved"
                                : "reminder-button"
                            }
                            onClick={() => handleReminder(reminder)}
                          >
                            <span>
                              {savedReminder === reminder ? "✓" : "◷"}
                            </span>

                            {savedReminder === reminder
                              ? `Rappel : ${reminder}`
                              : reminder}
                          </button>
                        ))}
                      </div>
                    )}

                    {savedReminder && (
                      <div className="reminder-confirmation">
                        ✓ Rappel préparé pour{" "}
                        <strong>{savedReminder}</strong>.
                        <small>
                          Les notifications seront connectées dans une
                          prochaine version.
                        </small>
                      </div>
                    )}
                  </div>
                )}

                <div className="next-step">
                  <div>
                    <span className="eyebrow">PROCHAINE ÉTAPE</span>
                    <strong>On s'occupe du reste.</strong>
                  </div>

                  <button
                    onClick={() => {
                      setActiveAction(null);
                      setResponse(null);
                    }}
                  >
                    Continuer →
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === "history" && (
          <section className="page-section">
            <span className="eyebrow">TON ESPACE</span>

            <h2>Historique</h2>

            <p className="page-description">
              Retrouve les problèmes sur lesquels Débrouille t'a aidé.
            </p>

            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◌</div>

                <strong>Rien pour le moment</strong>

                <p>
                  Tes demandes apparaîtront ici dès que tu utiliseras
                  Débrouille.
                </p>

                <button onClick={reset}>Commencer</button>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <button
                    className="history-item"
                    key={item.id}
                    onClick={() => {
                      setProblem(item.text);

                      setResponse({
                        title: "J'ai compris ton problème.",
                        intro:
                          item.answer ||
                          "Voici la réponse précédemment obtenue.",
                        steps: [
                          "Comprendre la situation",
                          "Identifier les options possibles",
                          "Passer à l'action",
                        ],
                      });

                      setActiveAction(null);
                      setActiveTab("home");
                    }}
                  >
                    <span className="history-icon">✓</span>

                    <span className="history-text">
                      <strong>{item.text}</strong>
                      <small>{item.date}</small>
                    </span>

                    <span>→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "profile" && (
          <section className="page-section">
            <span className="eyebrow">DÉBROUILLE</span>

            <h2>Ton espace</h2>

            <p className="page-description">
              La bêta est gratuite. Les fonctions premium arriveront plus
              tard.
            </p>

            <div className="profile-card">
              <div className="profile-avatar">D</div>

              <div>
                <strong>Mode bêta</strong>
                <p>Tu découvres actuellement Débrouille.</p>
              </div>
            </div>

            <div className="premium-preview">
              <span className="premium-label">BIENTÔT</span>

              <h3>Débrouille+</h3>

              <p>
                Plus de demandes, mémoire, suivi des problèmes et fonctions
                avancées.
              </p>

              <strong>7,99 € / mois</strong>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={activeTab === "home" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("home")}
        >
          <span>⌂</span>
          <small>Accueil</small>
        </button>

        <button
          className={
            activeTab === "history" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActiveTab("history")}
        >
          <span>◷</span>
          <small>Historique</small>
        </button>

        <button
          className={
            activeTab === "profile" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActiveTab("profile")}
        >
          <span>○</span>
          <small>Moi</small>
        </button>
      </nav>
    </div>
  );
}

export default App;