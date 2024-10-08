import { composeCssClass } from "@kickass-coderz/utils"
import { ReactElement } from "react"
import {
  RenderBoardProps,
  boardSize,
  Player,
  PieceState,
  SquareId,
} from "../types"
import { getReachableFields, getPiece } from "../utils"
import styles from "../Game.module.css"
import { RenderPiece } from "."

const columns = ["A", "B", "C", "D", "E", "F", "G", "H"]
const reversedColumns = [...columns].reverse()

export const RenderBoard = ({
  state,
  selectedSquare,
  onSquareClick,
  battle,
  currentPlayer,
  player,
}: RenderBoardProps): ReactElement => {
  const board: ReactElement[] = []
  const fieldsInRadiusOfPower = selectedSquare
    ? getReachableFields(selectedSquare, state)
    : []

  const render = ({ squareId }: { squareId: SquareId }) => {
    const square = state[squareId]
    const [piecePlayer, piece] = getPiece(square)
    let pieceState = PieceState.Idle

    if (
      piecePlayer === currentPlayer ||
      battle?.attackedSquareState.id === squareId
    ) {
      pieceState = PieceState.Ready
    }

    board.push(
      <div
        key={squareId}
        className={composeCssClass(
          styles.square,
          piecePlayer === Player.White
            ? styles.squareWhite
            : styles.squareBlack,
          selectedSquare === squareId && styles.squareSelected,
          battle?.attackedSquareState.id === squareId && styles.squareSelected,
          !battle &&
            fieldsInRadiusOfPower.includes(squareId) &&
            styles.squareOption
        )}
        onClick={() => {
          onSquareClick({ square: squareId, squareState: [piecePlayer, piece] })
        }}
      >
        <RenderPiece state={pieceState} piece={piece} />
      </div>
    )
  }

  const reverseBoard = player === Player.Black

  if (reverseBoard) {
    for (let i = boardSize[0] - 1; i >= 0; i--) {
      for (let j = boardSize[1] - 1; j >= 0; j--) {
        const squareId = `${i},${j}` as SquareId
        render({ squareId })
      }
    }
  } else {
    for (let i = 0; i < boardSize[0]; i++) {
      for (let j = 0; j < boardSize[1]; j++) {
        const squareId = `${i},${j}` as SquareId
        render({ squareId })
      }
    }
  }

  const boardColumns = reverseBoard ? reversedColumns : columns

  return (
    <>
      <div className={styles.boardTop}>
        <div className={styles.boardInner}>
          {boardColumns.map((column) => (
            <div key={column} className={styles.squareInner}></div>
          ))}
        </div>
      </div>
      {board}
      <div className={styles.boardBottom}>
        <div className={styles.boardInner}>
          {boardColumns.map((column) => (
            <div key={column} className={styles.squareInner}></div>
          ))}
        </div>
      </div>
    </>
  )
}
