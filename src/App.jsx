import React, { useState, useEffect } from "react";
import "./App.css";
import charactersData from "./characters.json";
import { ALL_CHARACTERS } from "./charactersData";

const generateRows = (charactersList) => {
  const rows = [];
  for (let i = 0; i < charactersList.length; i += 3) {
    rows.push({
      id: i / 3,
      cols: charactersList.slice(i, i + 3),
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

  const selectedCharacter = ALL_CHARACTERS.find((char) => char.id === selectedId);
  const charExtraInfo = charactersData.find((char) => char.id === selectedId + 1) || {};
  const currentColor = charExtraInfo.color || "#FFCC00";

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

// ==========================================
  // CONFIGURAÇÃO: ARCO VERTICAL (Igual à sua linha)
  // ==========================================
  const VISIBLE_COUNT = 10; 
  const RADIUS = 650;        // Define o tamanho da curva (mantido o que você gostou)
  const CENTER_X = -600;     // Joga o centro do círculo lá para fora da tela (esquerda)
  const CENTER_Y = 570;      // Posição Y da carta central (aumente para descer a fileira inteira)

  return (
    <main className="layout-container" style={{ "--accent": currentColor }}>
      <section className="character-area" onWheel={handleScroll} aria-label="Seletor de Personagens">
        <div className="arch-container">
          {rows.slice(0, VISIBLE_COUNT).map((row, index) => {
            const offset = index - Math.floor(VISIBLE_COUNT / 2);
            
            // Multiplicador 13 mantém a distância ideal entre as cartas na curva
            const angleDeg = offset * 13; 
            const angleRad = angleDeg * (Math.PI / 180);
            
            const x = CENTER_X + Math.cos(angleRad) * RADIUS;
        
            const y = CENTER_Y + Math.sin(angleRad) * RADIUS;

            return (
              <div key={row.id} className="arch-row" style={{ transform: `translate(${x}px, ${y}px)` }}>
                {row.cols.map((char) => (
                  <div
                    key={char.id}
                    role="button"
                    tabIndex={0}
                    className={`char-slot ${selectedId === char.id ? "active" : ""}`}
                    onClick={() => setSelectedId(char.id)}
                    onKeyDown={(e) => handleKeyDown(e, char.id)}
                    aria-label={`Selecionar personagem ${char.name || char.id + 1}`}
                    aria-pressed={selectedId === char.id}
                  >
                    <span className="char-number">{char.id + 1}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
      <section className="right-panel" aria-label="Detalhes do Personagem">
        <div className="search-container">
          <input type="search" className="search-input" placeholder="Pesquisar personagem..." />
        </div>

        <div className="character-name-tag">{selectedCharacter?.name}</div>

        <div className="background-game-title" aria-hidden="true">
          {selectedCharacter?.game}
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
            {charExtraInfo.role || selectedCharacter?.game || "ARCANE"}
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