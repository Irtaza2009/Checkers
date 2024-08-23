import { Piece, PieceState, RenderPieceProps, pieceName } from "../types"

import Pawn from "../assets/pieces/o.svg"
import King from "../assets/pieces/x.svg"

import styles from "../Game.module.css"
import { composeCssClass } from "@kickass-coderz/utils"
import { useAudio } from "../hooks"
import pawnReadySound from "../assets/sounds/select.wav"
import kingReadySound from "../assets/sounds/select.wav"

const pieceImage: Record<Piece, string> = {
  [Piece.Checkers]: Pawn,
  [Piece.CheckersKing]: King,
}

const pieceReadySound: Record<Piece, string> = {
  [Piece.Checkers]: pawnReadySound,
  [Piece.CheckersKing]: kingReadySound,
}

export const RenderPiece = ({ piece, state }: RenderPieceProps) => {
  const image = pieceImage[piece]
  const readySoundSrc = pieceReadySound[piece]
  const { play: playReadySound } = useAudio({ src: readySoundSrc })

  if (!image) {
    return null
  }

  return (
    <img
      className={composeCssClass(
        styles.pieceImage,
        styles[`pieceState-${state}`],
        styles[`piece-${piece}`]
      )}
      src={image}
      alt={pieceName[piece]}
      onClick={() => {
        if (state === PieceState.Ready) {
          playReadySound({ loop: false })
        }
      }}
    />
  )
}
