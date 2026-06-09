import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tendrixLogo from "@/assets/tendrix-logo-blue.png";
import "@/styles/landing.css";
import {
  ChevronsRight, ArrowRight, PlayCircle, Briefcase, MapPin, Lock, CircleCheckBig, FileCheck2,
  Clock, Coins, FileText, Star, Radar, Sparkles, UserRoundCheck, ChevronRight, MessageCircle,
  Download, FileSearch, Handshake, Landmark, Check, ShieldCheck, Apple,
} from "lucide-react";

// Glyphe Google Play (logo couleur officiel, approximé en SVG)
const PlayStoreGlyph = () => (
  <svg width="22" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.6 1.3C3.3 1.6 3.1 2.1 3.1 2.7v18.6c0 .6.2 1.1.5 1.4l.1.1 10.4-10.4v-.2L3.6 1.3z" fill="#00C3FF" />
    <path d="M17.5 15.3l-3.5-3.5v-.2l3.5-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.2 2.3z" fill="#FFCE00" />
    <path d="M17.6 15.2L14 11.7 3.6 22.1c.4.4 1.1.5 1.8.1l12.2-7" fill="#FF3D00" />
    <path d="M17.6 8.2L5.4 1.2C4.7.8 4 .9 3.6 1.3L14 11.7l3.6-3.5z" fill="#00E676" />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const go = () => navigate("/questionnaire-pme"); // entrée du tunnel de vente
  const login = () => navigate("/login");

  // Comportements : nav "scrolled" + apparition au scroll (reveal)
  useEffect(() => {
    const nav = document.getElementById("tdx-nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".tdx-landing .reveal").forEach((el) => io.observe(el));

    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  return (
    <div className="tdx-landing" data-hero="a" id="top">
      {/* ══════════ NAV ══════════ */}
      <header className="nav" id="tdx-nav">
        <div className="wrap nav-in">
          <a className="nav-logo" href="#top"><img src={tendrixLogo} alt="Tendrix" /></a>
          <nav className="nav-links">
            <a href="#comment">Comment ça marche</a>
            <a href="#humain">Accompagnement</a>
            <a href="#source">Nos données</a>
          </nav>
          <div className="nav-right">
            <button className="nav-login" onClick={login}>Connexion</button>
            <button className="btn btn-primary" onClick={go}>Voir mes marchés <ArrowRight className="arr" size={16} /></button>
          </div>
        </div>
      </header>

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-content">
              <span className="eyebrow"><span className="chev"><ChevronsRight size={15} /></span> Marchés publics, simplifiés</span>
              <h1 style={{ marginTop: 16 }}>Remportez plus de marchés publics, <span className="hl">sans y passer vos nuits.</span></h1>
              <p className="sub">Tendrix détecte les appels d'offres faits pour votre entreprise, les analyse pour vous dire s'il faut y aller, et prépare votre réponse. Un chargé d'affaires vous accompagne, du premier clic au dépôt.</p>

              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={go}>Essayez gratuitement <ArrowRight className="arr" size={18} /></button>
                <a className="btn btn-ghost btn-lg" href="#comment"><PlayCircle size={20} /> Comment ça marche</a>
              </div>

              <div className="store-badges">
                <button className="store-badge" onClick={go} aria-label="Télécharger sur l'App Store">
                  <Apple size={24} fill="#fff" />
                  <span><small>Télécharger sur</small><b>l'App Store</b></span>
                </button>
                <button className="store-badge" onClick={go} aria-label="Disponible sur Google Play">
                  <PlayStoreGlyph />
                  <span><small>Disponible sur</small><b>Google Play</b></span>
                </button>
              </div>

              <div className="hero-microtrust"><span className="dot" /> Importez les marchés que vous avez repérés, ou laissez-vous guider par nos recommandations.</div>
            </div>

            {/* Mockup produit */}
            <div className="mock">
              <div className="mock-float float-go reveal">
                <span className="ic"><CircleCheckBig size={19} /></span>
                <div><div className="ttl">Verdict : GO</div><div className="sub2">Foncez, c'est pour vous</div></div>
              </div>
              <div className="mock-float float-credit reveal">
                <span className="ic"><FileCheck2 size={19} /></span>
                <div><div className="ttl">Réponse prête à 78&nbsp;%</div><div className="sub2">Mémoire + pièces générés</div></div>
              </div>

              <div className="mock-frame">
                <div className="mock-bar">
                  <span className="tl" style={{ background: "#f3625a" }} />
                  <span className="tl" style={{ background: "#f6bb3f" }} />
                  <span className="tl" style={{ background: "#54c45e" }} />
                  <span className="url"><Lock size={11} /> app.tendrix.fr/analyses</span>
                </div>
                <div className="mock-body">
                  <div className="m-analysis">
                    <div className="m-card m-verdict">
                      <div className="m-ring">
                        <svg width="96" height="96">
                          <circle cx="48" cy="48" r="43.5" fill="none" stroke="var(--line)" strokeWidth="9" />
                          <circle cx="48" cy="48" r="43.5" fill="none" stroke="var(--go-dot)" strokeWidth="9" strokeLinecap="round" strokeDasharray="273.3" strokeDashoffset="21.9" />
                        </svg>
                        <div className="val"><b className="tnum">92<span style={{ fontSize: 14, color: "var(--muted)" }}>%</span></b><span>compatibilité</span></div>
                      </div>
                      <span className="v-chip v-go"><span className="dot" />GO</span>
                    </div>
                    <div className="m-card m-right">
                      <div>
                        <div className="m-title">Fourniture de matériel — Ville de Lyon</div>
                        <div className="m-meta">
                          <span><MapPin size={12} /> Lyon (69)</span>
                          <span><Coins size={12} /> 480 000 €</span>
                          <span><Clock size={12} /> J−13</span>
                        </div>
                      </div>
                      <div className="m-row"><span className="lbl">Valeur technique</span><span className="m-bar"><i style={{ width: "50%" }} /></span><span className="pct tnum">50%</span></div>
                      <div className="m-row"><span className="lbl">Prix</span><span className="m-bar"><i style={{ width: "40%" }} /></span><span className="pct tnum">40%</span></div>
                      <div className="m-row"><span className="lbl">Délais</span><span className="m-bar"><i style={{ width: "10%" }} /></span><span className="pct tnum">10%</span></div>
                      <div className="m-doc"><FileText size={16} style={{ color: "var(--navy)" }} /> CCTP — Cahier des charges.pdf <Star className="star" size={16} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CHIFFRES ══════════ */}
        <section className="stats">
          <div className="wrap stats-grid">
            <div className="stat reveal"><div className="num tnum">12 000<span className="u">+</span></div><div className="lab">marchés publics analysés chaque année</div></div>
            <div className="stat reveal"><div className="num tnum">90<span className="u">s</span></div><div className="lab">pour un verdict Go / No-Go</div></div>
            <div className="stat reveal"><div className="num tnum">&lt;&nbsp;1<span className="u">h</span></div><div className="lab">pour boucler certaines réponses</div></div>
            <div className="stat reveal"><div className="num tnum">1</div><div className="lab">chargé d'affaires dédié, inclus</div></div>
          </div>
        </section>

        {/* ══════════ COMMENT ÇA MARCHE ══════════ */}
        <section className="section" id="comment">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow"><span className="chev"><ChevronsRight size={15} /></span> Comment ça marche</span>
              <h2>De l'opportunité au dépôt, sans la paperasse.</h2>
              <p>Tendrix prend en charge la partie pénible des marchés publics. Vous gardez la décision et le savoir-faire.</p>
            </div>
            <div className="steps">
              {[
                { n: "01", Icon: Radar, t: "On détecte vos marchés", p: "Importez les marchés que vous repérez, ou laissez Tendrix vous recommander en continu les appels d'offres qui collent à votre activité et votre zone d'intervention." },
                { n: "02", Icon: Sparkles, t: "L'IA tranche pour vous", p: "Un verdict clair, Go ou No-Go, pour chaque marché : lots, prérequis, critères de jugement et calendrier. Vous savez en un coup d'œil si ça vaut le coup." },
                { n: "03", Icon: FileText, t: "Votre réponse, pré-rédigée", p: "Mémoire technique et pièces administratives générés à partir de votre profil et de votre librairie de documents. Vous n'avez plus qu'à relire et valider." },
                { n: "04", Icon: UserRoundCheck, t: "Un expert vous épaule", p: "Votre chargé d'affaires récupère les DCE, répond à vos questions et sécurise le dépôt dans les délais. À aucun moment vous n'êtes seul." },
              ].map(({ n, Icon, t, p }) => (
                <div className="step reveal" key={n}>
                  <div className="step-card">
                    <span className="step-num">{n}</span>
                    <div className="step-n"><Icon size={24} /></div>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                  <span className="step-arrow"><ChevronRight size={24} /></span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 48 }} className="reveal">
              <button className="btn btn-primary btn-lg" onClick={go}>Voir les marchés faits pour moi <ArrowRight className="arr" size={18} /></button>
            </div>
          </div>
        </section>

        {/* ══════════ ACCOMPAGNEMENT HUMAIN ══════════ */}
        <section className="section section-alt" id="humain">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow"><span className="chev"><ChevronsRight size={15} /></span> L'humain au centre</span>
              <h2>Un logiciel puissant. Une vraie personne derrière.</h2>
              <p>L'IA fait gagner du temps ; votre chargé d'affaires fait gagner des marchés. Les deux travaillent pour vous.</p>
            </div>
            <div className="human">
              <div className="human-card reveal">
                <div className="human-person">
                  <div className="human-av">CF</div>
                  <div>
                    <div className="nm">Camille Forestier</div>
                    <div className="rl">Chargée d'affaires Tendrix · secteur Rhône</div>
                  </div>
                </div>
                <p className="human-quote">« Je connais votre entreprise, vos projets et vos contraintes. Mon rôle, c'est de m'assurer que vous ne ratez aucune opportunité et que chaque dossier part complet, dans les temps. »</p>
                <div className="human-actions">
                  <button className="btn btn-accent" onClick={go}><MessageCircle size={16} /> Parler à un expert</button>
                  <button className="btn btn-white" onClick={go}>Voir mes marchés</button>
                </div>
              </div>
              <div className="human-pills">
                {[
                  { Icon: Download, t: "Récupération des DCE", p: "On télécharge les dossiers de consultation à votre place, même sur les plateformes les plus capricieuses." },
                  { Icon: FileSearch, t: "Relecture avant dépôt", p: "Votre chargé d'affaires relit votre dossier, vérifie les pièces et lève les derniers points bloquants." },
                  { Icon: Handshake, t: "Conseil sur-mesure", p: "Un interlocuteur unique qui connaît votre métier, votre secteur et vos références." },
                ].map(({ Icon, t, p }) => (
                  <div className="feat reveal" key={t}>
                    <span className="ic"><Icon size={19} /></span>
                    <div><h4>{t}</h4><p>{p}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ SOURCE OFFICIELLE ══════════ */}
        <section className="section" id="source">
          <div className="wrap">
            <div className="source reveal">
              <div className="source-badge"><Landmark size={38} /></div>
              <div>
                <h3>Des données 100 % officielles, à la source.</h3>
                <p>Tendrix s'appuie directement sur le BOAMP et les profils acheteurs publics (PLACE — marchés-publics.gouv.fr). Aucune opportunité inventée : chaque marché est sourcé, traçable et mis à jour quotidiennement.</p>
                <div className="source-tags">
                  <span className="tag"><span className="dot" /> BOAMP</span>
                  <span className="tag"><span className="dot" /> PLACE — marchés-publics.gouv.fr</span>
                  <span className="tag"><span className="dot" /> Mise à jour quotidienne</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={go} style={{ flexShrink: 0 }}>Voir mes marchés <ArrowRight className="arr" size={16} /></button>
            </div>
          </div>
        </section>

        {/* ══════════ CTA FINAL ══════════ */}
        <section className="section" id="demarrer" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="cta reveal">
              <h2>Voyez les marchés publics faits pour votre entreprise.</h2>
              <p>Créez votre profil en 2 minutes. Les premières opportunités s'affichent aussitôt.</p>
              <div className="start-card">
                <div className="start-row">
                  <label className="start-field"><Briefcase size={16} /><input type="text" placeholder="Votre activité (services, informatique, BTP…)" /></label>
                  <button className="btn btn-accent" onClick={go} style={{ flexShrink: 0 }}>Voir mes marchés <ArrowRight className="arr" size={16} /></button>
                </div>
                <p className="start-note"><Lock size={16} /> Sans engagement · sans carte bancaire · accompagnement inclus</p>
              </div>
              <div className="cta-micro">
                <span><Check className="chk" size={16} /> Profil en 2 minutes</span>
                <span><Check className="chk" size={16} /> Marchés visibles aussitôt</span>
                <span><Check className="chk" size={16} /> Un expert vous rappelle</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-logo">
              <img src={tendrixLogo} alt="Tendrix" />
              <p>La plateforme qui aide les entreprises à détecter, analyser et remporter les marchés publics.</p>
            </div>
            <div>
              <h5>Produit</h5>
              <ul>
                <li><a href="#comment">Comment ça marche</a></li>
                <li><a href="#humain">Accompagnement</a></li>
                <li><a href="#source">Nos données</a></li>
                <li><a href="#demarrer">Voir mes marchés</a></li>
              </ul>
            </div>
            <div>
              <h5>Entreprise</h5>
              <ul>
                <li><a href="#">À propos</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Recrutement</a></li>
              </ul>
            </div>
            <div>
              <h5>Légal</h5>
              <ul>
                <li><a href="/mentions-legales">Mentions légales</a></li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">CGU</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Tendrix. Tous droits réservés.</span>
            <span className="src"><ShieldCheck size={16} style={{ color: "var(--go-dot)" }} /> Données officielles BOAMP &amp; PLACE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
