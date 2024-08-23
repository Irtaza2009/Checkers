import type { PlayerId, RuneClient } from "rune-games-sdk/multiplayer"
import {
  OwnedPiece,
  Player,
  SquareId,
  initialBoardState,
  BattleState,
  Piece,
  playerName,
  boardSize,
} from "./types"
import { getPiece } from "./utils"

export interface GameState {
  players: Record<string, Player>
  playerToId: Record<Player, string>
  board: Record<SquareId, OwnedPiece>
  selectedSquare?: SquareId
  currentPlayer: Player
  battle?: BattleState
  playerIds: PlayerId[]

  notification?: {
    message: string
    timestamp: number
  }
}

type GameActions = {
  movePiece: ({
    squareId,
    newSquareId,
  }: {
    squareId: SquareId
    newSquareId: SquareId
  }) => void
  removePiece: ({ squareIds }: { squareIds: SquareId[] }) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const endTurn = (game: GameState) => {
  game.currentPlayer =
    game.currentPlayer === Player.White ? Player.Black : Player.White
}

const movePiece = (
  { squareId, newSquareId }: { squareId: SquareId; newSquareId: SquareId },
  { game }: { game: GameState }
) => {
  game.board[newSquareId] = game.board[squareId]
  delete game.board[squareId]

  // Promotion check
  const [player, pieceType] = getPiece(game.board[newSquareId])
  const [x, y] = newSquareId.split(",").map(Number)
  if (pieceType === Piece.Checkers && (x === 0 || x === boardSize[1] - 1)) {
    game.board[newSquareId] = `${player}${Piece.CheckersKing}`
  }
}

const checkGameOver = (game: GameState) => {
  const whitePieces = Object.values(game.board).filter((piece) =>
    piece.startsWith(Player.White)
  ).length
  const blackPieces = Object.values(game.board).filter((piece) =>
    piece.startsWith(Player.Black)
  ).length

  if (whitePieces === 0) {
    // Black wins
    Rune.gameOver({
      players: {
        [game.playerToId[Player.Black]]: "WON",
        [game.playerToId[Player.White]]: "LOST",
      },
    })
  } else if (blackPieces === 0) {
    // White wins
    Rune.gameOver({
      players: {
        [game.playerToId[Player.White]]: "WON",
        [game.playerToId[Player.Black]]: "LOST",
      },
    })
  }
}

const removePiece = (
  { squareIds }: { squareIds: SquareId[] },
  { game }: { game: GameState }
) => {
  squareIds.forEach((squareId) => {
    console.log(`Attempting to remove piece from ${squareId}`)

    if (!game.board[squareId]) {
      console.error(`No piece found at ${squareId}`)
      throw Rune.invalidAction()
    }

    const [currentPlayer] = getPiece(game.board[squareId])

    if (currentPlayer === game.currentPlayer) {
      console.error(`Cannot remove own piece at ${squareId}`)
      throw Rune.invalidAction()
    }

    delete game.board[squareId]
    console.log(`Piece removed from ${squareId}`)
  })
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => {
    return {
      players: {
        [allPlayerIds[0]]: Player.White,
        [allPlayerIds[1]]: Player.Black,
      },
      playerToId: {
        [Player.White]: allPlayerIds[0],
        [Player.Black]: allPlayerIds[1],
      },
      board: {
        ...initialBoardState,
      },
      selectedSquare: undefined,
      currentPlayer: Player.White,
      battle: undefined,
      playerIds: allPlayerIds,
    }
  },
  actions: {
    movePiece: ({ squareId, newSquareId }, { game }) => {
      if (game.board[squareId] === undefined) {
        throw Rune.invalidAction()
      }

      const [currentPlayer] = getPiece(game.board[squareId])

      if (currentPlayer !== game.currentPlayer) {
        throw Rune.invalidAction()
      }

      if (game.board[newSquareId] !== undefined) {
        // this requires battle

        throw Rune.invalidAction()
      }

      movePiece({ squareId, newSquareId }, { game })

      checkGameOver(game)

      endTurn(game)
    },
    removePiece: ({ squareIds }, { game }) => {
      removePiece({ squareIds }, { game })
    },
  },
})
