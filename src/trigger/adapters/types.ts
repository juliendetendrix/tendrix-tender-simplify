// Interface commune à tous les adaptateurs de plateformes de dématérialisation.
// Chaque moteur (e-marchespublics, PLACE, marches-securises…) implémente
// cette fonction : à partir de l'URL plateforme + référence, il ramène les
// fichiers du DCE.

export interface DceFile {
  name: string;          // nom de fichier (ex. "CCTP.pdf")
  buffer: Buffer;        // contenu brut
  contentType: string;   // ex. "application/pdf"
}

export interface ScrapeInput {
  platformUrl: string;          // URL du profil acheteur (résolveur)
  reference: string | null;     // référence de consultation (résolveur)
  buyer?: string | null;        // nom de l'acheteur (aide à désambiguïser)
  title?: string | null;        // objet du marché (clé de recherche de repli)
}

export type ScrapeAdapter = (input: ScrapeInput) => Promise<DceFile[]>;
