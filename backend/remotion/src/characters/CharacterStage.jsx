import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { PersonCharacter } from "./PersonCharacter.jsx";
import { DeityCharacter } from "./DeityCharacter.jsx";
import { AnimalCharacter } from "./AnimalCharacter.jsx";
import { PropIcon } from "./Props.jsx";

function renderCharacter(character, mirror) {
  if (!character) return null;
  if (character.kind === "deity") {
    return <DeityCharacter variant={character.variant} pose={character.pose} mirror={mirror} />;
  }
  if (character.kind === "animal") {
    return <AnimalCharacter species={character.variant} pose={character.pose} mirror={mirror} />;
  }
  return <PersonCharacter variant={character.variant} pose={character.pose} mirror={mirror} />;
}

export function CharacterStage({ characters = [], prop }) {
  const { width, height } = useVideoConfig();
  const hasTwo = characters.length === 2;

  return (
    <AbsoluteFill>
      {hasTwo ? (
        <>
          <div style={{ position: "absolute", left: width * 0.22, top: height * 0.32, transform: "translate(-50%, 0)" }}>
            {renderCharacter(characters[0], false)}
          </div>
          <div style={{ position: "absolute", left: width * 0.78, top: height * 0.32, transform: "translate(-50%, 0)" }}>
            {renderCharacter(characters[1], true)}
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: width * 0.5, top: height * 0.28, transform: "translate(-50%, 0)" }}>
          {renderCharacter(characters[0], false)}
        </div>
      )}

      {prop && (
        <div style={{ position: "absolute", left: width * 0.5, top: height * 0.6, transform: "translate(-50%, 0)" }}>
          <PropIcon type={prop} size={100} />
        </div>
      )}
    </AbsoluteFill>
  );
}
