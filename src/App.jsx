import React, { useState, useEffect, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCharacter = useMemo(
    () =>
      ALL_CHARACTERS.find((char) => char.id === selectedId) ||
      ALL_CHARACTERS[0],
    [selectedId],
  );
  const currentColor = selectedCharacter.color || "#FFCC00";

  useEffect(() => {
    setShowIdleVideo(false);
  }, [selectedId]);

  const handleScroll = (e) => {
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

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedId(id);
    }
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
                    <div
                      key={char.id}
                      role="button"
                      tabIndex={0}
                      className={`char-slot ${selectedId === char.id ? "active" : ""} ${!isMatch ? "dimmed" : ""}`}
                      onClick={() => setSelectedId(char.id)}
                      onKeyDown={(e) => handleKeyDown(e, char.id)}
                      aria-label={`Selecionar personagem ${char.name}`}
                      aria-pressed={selectedId === char.id}
                    >
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="char-avatar-img"
                      />
                      <span className="char-number">{char.id + 1}</span>
                    </div>
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
          {!showIdleVideo ? (
            <video
              key={`intro-${selectedCharacter?.id}`}
              src={selectedCharacter?.videoIntro}
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
