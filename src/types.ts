export const boardSize = [8, 8]

export enum Piece {
    Checkers = 'C',
    CheckersKing = 'K'
}

export enum Player {
    White = 'W',
    Black = 'B'
}

export const playerName = {
    [Player.White]: 'Green',
    [Player.Black]: 'Red'
}

export const piecePower = {
    [Piece.Checkers]: 1,
    [Piece.CheckersKing]: 2
}

export const pieceName = {
    [Piece.Checkers]: 'Checkers',
    [Piece.CheckersKing]: 'CheckersKing'
}

export type OwnedPiece = `${Player}${Piece}`

export type SquareId = `${number},${number}`

export type BoardState = Record<SquareId, OwnedPiece>

export type RenderBoardProps = {
    state: BoardState
    selectedSquare?: SquareId
    onSquareClick: ({ square, squareState }: { square: SquareId; squareState: [Player, Piece] }) => void
    battle?: BattleState
    currentPlayer: Player
    player?: Player
}

export type BattleState = {
    player1: Player
    player2: Player
    player1TargetScore: number
    player2TargetScore: number
    attackingSquareState: { id: SquareId; state: [Player, Piece] }
    attackedSquareState: { id: SquareId; state: [Player, Piece] }
    player1Score: number
    player2Score: number
    player1Move?: string
    player2Move?: string
}

export const oWhite = (piece: Piece): OwnedPiece => `${Player.White}${piece}`

export const oBlack = (piece: Piece): OwnedPiece => `${Player.Black}${piece}`

export const initialBoardState: BoardState = {
    '0,1': oBlack(Piece.Checkers),
    '0,3': oBlack(Piece.Checkers),
    '0,5': oBlack(Piece.Checkers),
    '0,7': oBlack(Piece.Checkers),
    '1,0': oBlack(Piece.Checkers),
    '1,2': oBlack(Piece.Checkers),
    '1,4': oBlack(Piece.Checkers),
    '1,6': oBlack(Piece.Checkers),
    '2,1': oBlack(Piece.Checkers),
    '2,3': oBlack(Piece.Checkers),
    '2,5': oBlack(Piece.Checkers),
    '2,7': oBlack(Piece.Checkers),
    '5,0': oWhite(Piece.Checkers),
    '5,2': oWhite(Piece.Checkers),
    '5,4': oWhite(Piece.Checkers),
    '5,6': oWhite(Piece.Checkers),
    '6,1': oWhite(Piece.Checkers),
    '6,3': oWhite(Piece.Checkers),
    '6,5': oWhite(Piece.Checkers),
    '6,7': oWhite(Piece.Checkers),
    '7,0': oWhite(Piece.Checkers),
    '7,2': oWhite(Piece.Checkers),
    '7,4': oWhite(Piece.Checkers),
    '7,6': oWhite(Piece.Checkers)
}

export enum PieceState {
    Idle = 'Idle',
    Ready = 'Ready'
}

export type RenderPieceProps = {
    piece: Piece
    state: PieceState
}

export const gameName = 'Checkers'

export type UseAudioProps = {
    src: string
}

export type UseAudioPause = () => void
export type UseAudioPlay = ({ loop }: { loop: boolean }) => UseAudioPause

export type UseAudio = {
    play: UseAudioPlay
    pause: UseAudioPause
}
