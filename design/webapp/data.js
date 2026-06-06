// ─────────────────────────────────────────────────────────────
// Tendrix — données mock (FR) pour le prototype de redesign webapp
// ─────────────────────────────────────────────────────────────
window.TENDRIX = (function () {
  const company = { name: "Bâtiment Rhône-Alpes", contact: "Julien Malherbe", email: "julien@bat-ra.fr", credits: 42 };

  const ca = {
    display_name: "Camille Forestier",
    role: "Chargée d'affaires",
    initials: "CF",
    phone: "+33 6 12 34 56 78",
    email: "camille.forestier@tendrix.fr",
  };

  // KPIs dashboard
  const kpis = [
    { id: "credits",  label: "Crédits restants", value: 42, suffix: "", delta: "+12 ce mois", trend: "up", icon: "coins" },
    { id: "encours",  label: "AO en cours",      value: 7,  suffix: "", delta: "2 échéances < 7j", trend: "warn", icon: "briefcase" },
    { id: "analyses", label: "Analyses · 30j",   value: 23, suffix: "", delta: "+8 vs. mois préc.", trend: "up", icon: "file-search" },
    { id: "taux",     label: "Taux GO",          value: 61, suffix: "%", delta: "14 GO / 23", trend: "up", icon: "target" },
  ];

  // Opportunités (marchés)
  const tenders = [
    { id: "t1", title: "Réfection de la toiture-terrasse du groupe scolaire Jean Moulin", organisme: "Ville de Villeurbanne", location: "Villeurbanne (69)", budget: "480 000 €", deadline: "18 juin 2026", deadlineDays: 13, datePublication: "2026-05-21", famille: "Couverture / Étanchéité", procedure: "Procédure adaptée (MAPA)", match: 92, cpv: ["45261000"] },
    { id: "t2", title: "Travaux de rénovation énergétique — Hôtel de Ville", organisme: "Métropole de Lyon", location: "Lyon (69)", budget: "1 240 000 €", deadline: "24 juin 2026", deadlineDays: 19, datePublication: "2026-05-19", famille: "Rénovation énergétique", procedure: "Appel d'offres ouvert", match: 84, cpv: ["45321000"] },
    { id: "t3", title: "Maintenance des installations CVC — collèges du département", organisme: "Conseil Départemental du Rhône", location: "Rhône (69)", budget: "320 000 € / an", deadline: "9 juin 2026", deadlineDays: 4, datePublication: "2026-05-12", famille: "CVC / Plomberie", procedure: "Accord-cadre", match: 78, cpv: ["50730000"] },
    { id: "t4", title: "Construction d'un préau et aménagement de la cour — école maternelle", organisme: "Commune de Caluire-et-Cuire", location: "Caluire (69)", budget: "265 000 €", deadline: "30 juin 2026", deadlineDays: 25, datePublication: "2026-05-24", famille: "Gros œuvre", procedure: "Procédure adaptée (MAPA)", match: 71, cpv: ["45223000"] },
    { id: "t5", title: "Remplacement des menuiseries extérieures — résidence Les Tilleuls", organisme: "Bailleur social Est Métropole Habitat", location: "Bron (69)", budget: "590 000 €", deadline: "3 juillet 2026", deadlineDays: 28, datePublication: "2026-05-26", famille: "Menuiserie", procedure: "Appel d'offres ouvert", match: 66, cpv: ["45421000"] },
  ];

  // Dossiers / pipeline (par statut)
  const dossiers = [
    { id: "d1", title: "Réfection toiture — gymnase municipal", organisme: "Ville de Vénissieux", budget: "410 000 €", deadline: "11 juin 2026", deadlineDays: 6, status: "demande",  progress: 25, verdict: "go" },
    { id: "d2", title: "Réaménagement des locaux techniques — piscine", organisme: "Métropole de Lyon", budget: "228 000 €", deadline: "16 juin 2026", deadlineDays: 11, status: "demande",  progress: 25, verdict: "go_with_reserve" },
    { id: "d3", title: "Rénovation thermique — 2 écoles élémentaires", organisme: "Ville de Saint-Priest", budget: "870 000 €", deadline: "20 juin 2026", deadlineDays: 15, status: "en_cours", progress: 55, verdict: "go" },
    { id: "d4", title: "Mise aux normes électriques — médiathèque", organisme: "Commune d'Oullins", budget: "145 000 €", deadline: "13 juin 2026", deadlineDays: 8, status: "en_cours", progress: 60, verdict: "go" },
    { id: "d5", title: "Étanchéité parking souterrain — centre commercial", organisme: "SEM Lyon Confluence", budget: "335 000 €", deadline: "28 mai 2026", deadlineDays: -2, status: "soumis", progress: 80, verdict: "go" },
    { id: "d6", title: "Réfection de façades — groupe scolaire Pasteur", organisme: "Ville de Bron", budget: "520 000 €", deadline: "2 mai 2026", deadlineDays: -20, status: "gagne", progress: 100, verdict: "go" },
  ];

  // Analyses récentes (avec verdict)
  const analyses = [
    { id: "a1", title: "Réfection toiture-terrasse — groupe scolaire Jean Moulin", organisme: "Ville de Villeurbanne", location: "Villeurbanne (69)", deadline: "18 juin 2026", verdict: "go", match: 92, date: "il y a 2 h" },
    { id: "a2", title: "Maintenance CVC — collèges du département", organisme: "CD du Rhône", location: "Rhône (69)", deadline: "9 juin 2026", verdict: "go_with_reserve", match: 78, date: "hier" },
    { id: "a3", title: "Menuiseries extérieures — résidence Les Tilleuls", organisme: "Est Métropole Habitat", location: "Bron (69)", deadline: "3 juil. 2026", verdict: "no_go", match: 41, date: "il y a 3 j" },
    { id: "a4", title: "Rénovation énergétique — Hôtel de Ville", organisme: "Métropole de Lyon", location: "Lyon (69)", deadline: "24 juin 2026", verdict: "go", match: 84, date: "il y a 4 j" },
  ];

  // Détail d'analyse (écran Analyse) — basé sur t1
  const analysisDetail = {
    id: "a1",
    title: "Réfection de la toiture-terrasse du groupe scolaire Jean Moulin",
    organisme: "Ville de Villeurbanne",
    location: "Villeurbanne (69)",
    deadline: "18 juin 2026",
    deadlineDays: 13,
    budget: "480 000 € HT",
    duree: "Marché de 8 mois à compter de la notification",
    lieu: "Groupe scolaire Jean Moulin, 12 rue Anatole France, 69100 Villeurbanne",
    visites: "Visite du site obligatoire — sur rendez-vous auprès des services techniques avant le 6 juin 2026.",
    procedure: "Procédure adaptée (MAPA) — Article R2123-1 du Code de la commande publique",
    verdict: "go",
    match: 92,
    avis: "Ce marché correspond fortement à votre cœur de métier (couverture / étanchéité) et à votre zone d'intervention. Vos références récentes sur des établissements scolaires et votre qualification QUALIBAT 3212 couvrent l'essentiel des exigences. Une visite de site obligatoire est à planifier rapidement.",
    attention: "La visite de site est obligatoire et conditionne la recevabilité de l'offre. Le créneau se ferme le 6 juin — pensez à prendre rendez-vous dès maintenant.",
    description: "Réfection complète de l'étanchéité de la toiture-terrasse (≈ 1 850 m²) du groupe scolaire, incluant la dépose de l'ancien complexe, la reprise des relevés, la fourniture et pose d'une membrane bicouche, et la mise en place de garde-corps périphériques.",
    lots: [
      { numero: "1", intitule: "Étanchéité / Couverture", ouvert: true,  resume: "Dépose, étanchéité bicouche, relevés et évacuations — ≈ 1 850 m²." },
      { numero: "2", intitule: "Serrurerie / Garde-corps", ouvert: true,  resume: "Fourniture et pose de garde-corps périphériques conformes NF E85-015." },
      { numero: "3", intitule: "Désamiantage ponctuel",      ouvert: false, resume: "Retrait de joints amiantés localisés — qualification SS3 requise." },
    ],
    calendrier: [
      { label: "Date de publication", valeur: "21 mai 2026" },
      { label: "Visite de site obligatoire", valeur: "Avant le 6 juin 2026" },
      { label: "Questions / réponses", valeur: "Jusqu'au 12 juin 2026" },
      { label: "Date limite de remise des offres", valeur: "18 juin 2026 à 12h00" },
      { label: "Démarrage prévisionnel", valeur: "Septembre 2026" },
    ],
    jugement: [
      { label: "Valeur technique", detail: "50 %" },
      { label: "Prix des prestations", detail: "40 %" },
      { label: "Délais d'exécution", detail: "10 %" },
    ],
    qualifications: [
      { label: "QUALIBAT 3212 — Étanchéité", obligatoire: true,  detail: "Étanchéité de toitures-terrasses. Votre certification est à jour (valable jusqu'au 03/2027)." },
      { label: "Attestation d'assurance décennale", obligatoire: true, detail: "Couvrant les travaux d'étanchéité et de couverture." },
      { label: "Qualification SS3 (désamiantage)", obligatoire: true, detail: "Requise pour le lot 3 — sous-traitance possible si non détenue." },
      { label: "Références établissements scolaires (3 ans)", obligatoire: false, detail: "Au moins 2 chantiers similaires sur les 3 dernières années." },
    ],
    documents: [
      { name: "Règlement de consultation.pdf", type: "RC", key: true, size: "248 Ko" },
      { name: "CCAP.pdf", type: "CCAP", key: true, size: "412 Ko" },
      { name: "CCTP — Lot 1 Étanchéité.pdf", type: "CCTP", key: true, size: "1,2 Mo" },
      { name: "DPGF — cadre de réponse.xlsx", type: "DPGF", key: true, size: "86 Ko" },
      { name: "Acte d'engagement.pdf", type: "AE", key: true, size: "132 Ko" },
      { name: "Plans de toiture — DOE.pdf", type: "Plans", key: false, size: "4,8 Mo" },
      { name: "Diagnostic amiante.pdf", type: "Annexe", key: false, size: "920 Ko" },
      { name: "Mémoire technique — trame.docx", type: "Annexe", key: false, size: "54 Ko" },
    ],
  };

  // Détail de réponse IA (écran Réponse)
  const responseDetail = {
    id: "r1",
    title: "Réfection de la toiture-terrasse du groupe scolaire Jean Moulin",
    organisme: "Ville de Villeurbanne",
    version: "1ʳᵉ version",
    synthese: "Dossier de réponse prêt à 78 %. Le mémoire technique couvre les 5 chapitres attendus et 6 pièces administratives sur 8 sont déjà disponibles dans votre librairie. Deux éléments restent à compléter avant dépôt.",
    completion: 78,
    memoire: [
      { titre: "1. Présentation de l'entreprise", contenu: "Bâtiment Rhône-Alpes est une entreprise spécialisée dans l'étanchéité et la couverture, implantée à Lyon depuis 2008. Forte de 34 collaborateurs et d'un chiffre d'affaires de 6,2 M€, elle intervient principalement sur des marchés publics d'établissements scolaires et de bâtiments tertiaires en région Auvergne-Rhône-Alpes…", words: 142, status: "ok" },
      { titre: "2. Méthodologie d'intervention", contenu: "La réfection de la toiture-terrasse sera réalisée en quatre phases : (1) installation de chantier et protection des accès scolaires, (2) dépose du complexe d'étanchéité existant et évacuation en filière agréée, (3) reprise des relevés et pose d'une membrane bicouche élastomère, (4) pose des garde-corps périphériques et contrôle d'étanchéité par mise en eau…", words: 218, status: "ok" },
      { titre: "3. Moyens humains et matériels", contenu: "L'équipe dédiée sera composée d'un conducteur de travaux, d'un chef d'équipe étanchéité et de 4 compagnons qualifiés. Matériel mobilisé : nacelle élévatrice, monte-matériaux, et équipements de sécurité collective conformes…", words: 96, status: "ok" },
      { titre: "4. Démarche environnementale", contenu: "", words: 0, status: "todo", hint: "À générer — l'IA peut produire un brouillon à partir de votre librairie RSE." },
      { titre: "5. Planning et délais", contenu: "Le chantier est planifié sur 8 mois, avec un démarrage en septembre 2026 pendant les vacances scolaires pour limiter les nuisances. Le planning Gantt détaillé figure en annexe…", words: 78, status: "ok" },
    ],
    pieces: [
      { label: "DC1 — Lettre de candidature", statut: "Disponible", ok: true },
      { label: "DC2 — Déclaration du candidat", statut: "Disponible", ok: true },
      { label: "Attestation d'assurance décennale", statut: "Disponible", ok: true },
      { label: "Certificat QUALIBAT 3212", statut: "Disponible", ok: true },
      { label: "Attestations fiscales et sociales", statut: "Disponible", ok: true },
      { label: "Extrait Kbis (< 3 mois)", statut: "Disponible", ok: true },
      { label: "Acte d'engagement complété", statut: "À compléter", ok: false },
      { label: "DPGF chiffrée", statut: "À compléter", ok: false },
    ],
    aCompleter: [
      "Renseigner le montant global et la décomposition de prix dans la DPGF (lot 1 et lot 2).",
      "Compléter le chapitre « Démarche environnementale » du mémoire technique.",
      "Confirmer la sous-traitance du lot 3 (désamiantage SS3) ou joindre la qualification.",
    ],
  };

  return { company, ca, kpis, tenders, dossiers, analyses, analysisDetail, responseDetail };
})();

// Constantes verdict partagées
window.VERDICT = {
  go:              { label: "GO",              phrase: "Foncez, ce marché est fait pour vous.",          tone: "go" },
  go_with_reserve: { label: "GO AVEC RÉSERVE", phrase: "Profil compatible, quelques points à lever.",     tone: "warn" },
  no_go:           { label: "NO GO",           phrase: "Ce marché ne semble pas adapté à votre profil.",  tone: "no" },
};
