import type { PlayerId, DuskClient } from "dusk-games-sdk/multiplayer"

export type Cells = (PlayerId | null)[]
export interface GameState {
  cells: Cells
  selectedCell: number | null
  currentPlayer: PlayerId | null
  playerIds: PlayerId[]
  isJumping: boolean
  // Add more state attributes if needed
}

type GameActions = {
  selectCell: (cellIndex: number) => void
  movePiece: (fromCellIndex: number, toCellIndex: number) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

function initializeBoard() {
  const cells = new Array(64).fill(null)

  for (let i = 0; i < 64; i++) {
    if (Math.floor(i / 8) % 2 === 0) {
      if (i % 2 === 1 && Math.floor(i / 8) < 3) cells[i] = "1" // Red pieces
      if (i % 2 === 1 && Math.floor(i / 8) > 4) cells[i] = "2" // Black pieces
    } else {
      if (i % 2 === 0 && Math.floor(i / 8) < 3) cells[i] = "1" // Red pieces
      if (i % 2 === 0 && Math.floor(i / 8) > 4) cells[i] = "2" // Black pieces
    }
  }

  return cells
}

Dusk.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    cells: initializeBoard(),
    selectedCell: null,
    currentPlayer: allPlayerIds[0],
    playerIds: allPlayerIds,
    isJumping: false,
  }),
  actions: {
    selectCell: (cellIndex, { game, playerId }) => {
      if (game.currentPlayer !== playerId) {
        throw Dusk.invalidAction()
      }

      if (game.selectedCell === null) {
        if (game.cells[cellIndex] === playerId) {
          game.selectedCell = cellIndex
        }
      } else {
        // Implement move logic
        if (canMove(game.selectedCell, cellIndex, game.cells)) {
          game.cells[cellIndex] = game.cells[game.selectedCell]
          game.cells[game.selectedCell] = null
          game.selectedCell = null
          game.currentPlayer = game.playerIds.find((id) => id !== playerId)
          // Check for captures and promotions
          checkForCaptures(game)
        } else {
          game.selectedCell = null
        }
      }
    },
    movePiece: (
      fromCellIndex: number,
      toCellIndex: number,
      { game, playerId }
    ) => {
      if (game.currentPlayer !== playerId) {
        throw Dusk.invalidAction()
      }

      // Move logic with capture and promotion handling
      if (canMove(fromCellIndex, toCellIndex, game.cells)) {
        game.cells[toCellIndex] = game.cells[fromCellIndex]
        game.cells[fromCellIndex] = null
        game.currentPlayer = game.playerIds.find((id) => id !== playerId)
        checkForCaptures(game)
      }
    },
  },
})

function canMove(
  fromCellIndex: number,
  toCellIndex: number,
  cells: Cells
): boolean {
  // Implement movement logic
  return true
}

function checkForCaptures(game: GameState) {
  // Implement capture logic and promotion (kinging) if needed
}
