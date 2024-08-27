import {
  SquareId,
  BoardState,
  boardSize,
  OwnedPiece,
  Player,
  Piece,
} from "./types"

export const getReachableFields = (
  selectedSquare: SquareId,
  state: BoardState,
  isContinuation: boolean = false,
  visited: Set<SquareId> = new Set()
): SquareId[] => {
  if (visited.has(selectedSquare)) return [] // Prevent revisiting the same square
  visited.add(selectedSquare)

  const [x, y] = selectedSquare.split(",").map(Number)
  const [selectedPlayer, selectedPiece] = getPiece(state[selectedSquare])
  const fields: SquareId[] = []

  const direction = selectedPlayer === "W" ? -1 : 1

  const moves = [
    [direction, -1],
    [direction, 1],
  ]

  if (selectedPiece === Piece.CheckersKing) {
    moves.push([-direction, -1]) // Backward-left
    moves.push([-direction, 1]) // Backward-right
  }

  for (const [dx, dy] of moves) {
    const targetX = x + dx
    const targetY = y + dy
    const targetSquare = `${targetX},${targetY}` as SquareId

    if (isValidMove(targetX, targetY)) {
      const [targetPlayer] = getPiece(state[targetSquare])

      if (!targetPlayer) {
        // Normal move to an empty square
        if (!isContinuation) {
          fields.push(targetSquare)
        }
      } else if (targetPlayer !== selectedPlayer) {
        // Capture move: jump over opponent's piece
        const jumpX = targetX + dx
        const jumpY = targetY + dy
        const jumpSquare = `${jumpX},${jumpY}` as SquareId
        if (isValidMove(jumpX, jumpY) && !getPiece(state[jumpSquare])[0]) {
          fields.push(jumpSquare)

          // Update state to reflect the jump
          const newState = { ...state }
          newState[selectedSquare] = undefined as any
          newState[targetSquare] = undefined as any
          newState[jumpSquare] = state[selectedSquare]

          // Recursively check for additional jumps after this one in all directions
          const continuationFields = getReachableFields(
            jumpSquare,
            newState,
            true,
            new Set(visited) // Pass a copy of visited
          )
          fields.push(...continuationFields)
        }
      }
    }
  }

  return fields
}

const isValidMove = (x: number, y: number): boolean => {
  return x >= 0 && x < boardSize[0] && y >= 0 && y < boardSize[1]
}

export const getPiece = (piece: OwnedPiece): [Player, Piece] => {
  return (piece || "").split("") as [Player, Piece]
}

export const notify = (message: string, handler: (message: string) => void) => {
  handler(message)
}
