import { PlayerId } from "dusk-games-sdk/multiplayer"
import { useEffect, useState } from "react"

import selectSoundAudio from "./assets/select.wav"
import { GameState } from "./logic.ts"

const selectSound = new Audio(selectSoundAudio)

function App() {
  const [game, setGame] = useState<GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()

  useEffect(() => {
    Dusk.initClient({
      onChange: ({ game, action, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        if (action && action.name === "selectCell") selectSound.play()
      },
    })
  }, [])

  if (!game) {
    // Dusk only shows your game after an onChange() so no need for loading screen
    return
  }

  const { cells, selectedCell, currentPlayer, playerIds, isJumping } = game

  return (
    <>
      <div id="board">
        {cells.map((cell, cellIndex) => {
          const isSelected = cellIndex === selectedCell
          const cellValue = cells[cellIndex]

          return (
            <button
              key={cellIndex}
              onClick={() => {
                if (selectedCell === null) {
                  Dusk.actions.selectCell(cellIndex)
                } else {
                  Dusk.actions.movePiece(selectedCell, cellIndex)
                }
              }}
              data-player={cellValue || ""}
              data-selected={isSelected}
              {...(cellValue || currentPlayer !== yourPlayerId
                ? { "data-disabled": "" }
                : {})}
            />
          )
        })}
      </div>
      <ul id="playersSection">
        {playerIds.map((playerId, index) => {
          const player = Dusk.getPlayerInfo(playerId)

          return (
            <li
              key={playerId}
              data-player={index.toString()}
              data-your-turn={String(currentPlayer === playerId)}
            >
              <img src={player.avatarUrl} />
              <span>
                {player.displayName}
                {player.playerId === yourPlayerId && (
                  <span>
                    <br />
                    (You)
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default App
