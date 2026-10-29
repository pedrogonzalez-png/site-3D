import React, { useState, useEffect, useMemo, useRef } from "react";
import "./App.css";
import { ALL_CHARACTERS } from "./charactersData";

const generateRows = (charactersList) => {
  const rows = [];
  // Agrupa de 2 em 2 colunas no arco (estilo Marvel Rivals)
  for (let i = 0; i < charactersList.length; i += 2) {
    rows.push({
      id: i / 2,
      cols: charactersList.slice(i, i + 2),
    });
  }
  return rows;
};

const initialRows = generateRows(ALL_CHARACTERS);
const TOTAL_CHARACTERS = ALL_CHARACTERS.length;

function App() {
  const [selectedId, setSelectedId] = useState(0);
  const [rows, setRows] = useState(initialRows);
  const [showIdleVideo, setShowIdleVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const mobileStripRef = useRef(null);

  const selectedCharacter = useMemo(
    () =>
      ALL_CHARACTERS.find((char) => char.id === selectedId) ||
      ALL_CHARACTERS[0],
    [selectedId],
  );
  const currentColor = selectedCharacter.color || "#FFCC00";
  const matchingCharacters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return ALL_CHARACTERS.filter((char) =>
      char.name.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  useEffect(() => {
    setShowIdleVideo(false);
    setVideoFailed(false);
  }, [selectedId]);

  const navigateMobile = (step) => {
    if (!matchingCharacters.length) return;
    const index = matchingCharacters.findIndex((char) => char.id === selectedId);
    const nextIndex =
      index === -1
        ? (step > 0 ? 0 : matchingCharacters.length - 1)
        : (index + step + matchingCharacters.length) % matchingCharacters.length;
    setSelectedId(matchingCharacters[nextIndex].id);
  };

  useEffect(() => {
    const strip = mobileStripRef.current;
    if (!strip) return;

    const centerActive = () => {
      if (window.matchMedia("(min-width: 1281px)").matches) return;
      const active = strip.querySelector(`[data-char-id="${selectedId}"]`);
      if (!active) return;
      const center = active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      strip.scrollTo({
        left: Math.max(0, center),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };

    centerActive();
    window.addEventListener("resize", centerActive);
    return () => window.removeEventListener("resize", centerActive);
  }, [selectedId, matchingCharacters]);

  const handleScroll = (e) => {
    if (window.matchMedia("(max-width: 1280px)").matches) return;
    const isScrollingDown = e.deltaY > 0;
    setRows((prevRows) => {
      const newRows = [...prevRows];
      if (isScrollingDown) {
        newRows.push(newRows.shift());
      } else {
        newRows.unshift(newRows.pop());
      }
      return newRows;
    });
  };

  // Geometria do Arco (Marvel Rivals)
  const VISIBLE_COUNT = 10;
  const RADIUS = 450;
  const START_ANGLE = -47;
  const STEP_ANGLE = 11;

  return (
    <main className="layout-container" style={{ "--accent": currentColor }}>
      {/* MENU ESQUERDO (ROLETA EM ARCO) */}
      <section
        className="character-area"
        onWheel={handleScroll}
        aria-label="Seletor de Personagens"
      >
        {/* Trilhos curvos no fundo */}
        <div className="arc-tracks-bg" />

        {/* Barra circular de personagens: visível no celular e tablet. */}
        <div className="mobile-selector">
          <button
            type="button"
            className="mobile-nav-arrow"
            aria-label="Personagem anterior"
            onClick={() => navigateMobile(-1)}
            disabled={matchingCharacters.length < 2}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m14.5 5-7 7 7 7" />
            </svg>
          </button>
          <div
            className="mobile-character-strip"
            ref={mobileStripRef}
            aria-label="Escolher personagem, deslizando para os lados"
          >
            {matchingCharacters.length ? (
              matchingCharacters.map((char) => (
                <button
                  key={char.id}
                  data-char-id={char.id}
                  type="button"
                  className={`char-slot ${selectedId === char.id ? "active" : ""}`}
                  onClick={() => setSelectedId(char.id)}
                  aria-label={`Selecionar personagem ${char.name}`}
                  aria-pressed={selectedId === char.id}
                >
                  <img src={char.avatar} alt="" className="char-avatar-img" loading="lazy" />
                </button>
              ))
            ) : (
              <p className="mobile-empty-state">Nenhum personagem encontrado.</p>
            )}
          </div>
          <button
            type="button"
            className="mobile-nav-arrow"
            aria-label="Próximo personagem"
            onClick={() => navigateMobile(1)}
            disabled={!matchingCharacters.length}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9.5 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="arch-container">
          {rows.slice(0, VISIBLE_COUNT).map((row, index) => {
            const angleDeg = START_ANGLE + index * STEP_ANGLE;

            return (
              <div
                key={row.id}
                className="arch-row"
                style={{
                  transform: `rotate(${angleDeg}deg) translateX(${RADIUS}px)`,
                }}
              >
                {row.cols.map((char) => {
                  const isMatch =
                    searchTerm === "" ||
                    char.name.toLowerCase().includes(searchTerm.toLowerCase());
                  return (
                    <button
                      key={char.id}
                      type="button"
                      className={`char-slot ${selectedId === char.id ? "active" : ""} ${!isMatch ? "dimmed" : ""}`}
                      onClick={() => setSelectedId(char.id)}
                      aria-label={`Selecionar personagem ${char.name}`}
                      aria-pressed={selectedId === char.id}
                    >
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="char-avatar-img"
                        loading="lazy"
                      />
                      <span className="char-number">{char.id + 1}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* PAINEL DIREITO (RENDER E HUD) */}
      <section
        className="right-panel"
        data-role={selectedCharacter?.role}
        aria-label="Detalhes do Personagem"
      >
        <div className="search-container">
          <input
            type="search"
            aria-label="Pesquisar personagem"
            className="search-input"
            placeholder="PESQUISAR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="character-name-tag">{selectedCharacter?.name}</div>

        <div className="background-game-title" aria-hidden="true">
          {selectedCharacter?.role}
        </div>

        <div className="character-render-container">
          {videoFailed ? (
            <img
              src={selectedCharacter.avatar}
              alt={selectedCharacter.name}
              className="character-fallback"
            />
          ) : !showIdleVideo ? (
            <video
              key={`intro-${selectedCharacter?.id}`}
              src={selectedCharacter?.videoIntro}
              poster={selectedCharacter.avatar}
              preload="metadata"
              onError={() => setShowIdleVideo(true)}
              autoPlay
              muted
              playsInline
              onEnded={() => setShowIdleVideo(true)}
              className="character-video"
            />
          ) : (
            <video
              key={`idle-${selectedCharacter?.id}`}
              src={selectedCharacter?.videoIdle}
              poster={selectedCharacter.avatar}
              preload="metadata"
              onError={() => setVideoFailed(true)}
              autoPlay
              loop
              muted
              playsInline
              className="character-video"
            />
          )}
        </div>

        <div className="top-info-bar">
          <span className="top-char-name">
            {selectedCharacter?.role || "ENDFIELD"}
          </span>
          <span className="top-counter">
            {String(selectedId + 1).padStart(2, "0")} / {TOTAL_CHARACTERS}
          </span>
        </div>
      </section>
    </main>
  );
}

export default App;
