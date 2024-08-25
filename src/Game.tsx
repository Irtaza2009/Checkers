import { PlayerId } from "dusk-games-sdk/multiplayer"
import styles from "./Game.module.css"
import { useCallback, useEffect, useState } from "react"
import {
  // Piece,
  Player,
  BoardState,
  SquareId,
  RenderBoardProps,
  BattleState,
  // pieceName,
  initialBoardState,
  gameName,
} from "./types"
import { RenderBoard } from "./components"
import { getReachableFields, getPiece, notify } from "./utils"
import { useAudio } from "./hooks"
import backgroundSound1 from "./assets/sounds/background_1.mp3"
import { composeCssClass } from "@kickass-coderz/utils"
//import InfoIcon from './assets/icons/info.png'

const Game = () => {
  const [isGameStarted, setGameStarted] = useState(false)
  const [state, setState] = useState<BoardState>(() => ({
    ...initialBoardState,
  }))
  const [selectedSquare, setSelectedSquare] = useState<SquareId>()
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.White)
  const [battle, setBattle] = useState<BattleState>()
  const { play: playBackgroundAudio } = useAudio({ src: backgroundSound1 })
  const [player, setPlayer] = useState<Player>()
  const [notification, setNotification] = useState<string>()
  const [playerIds, setPlayerIds] = useState<string[]>([]) // Initialize as an empty array
  const [lastMovePlayerId, setLastMovePlayerId] = useState<string | null>(null) // Last move player ID
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>() // Your player ID

  const isMyTurn = currentPlayer === player
  const isHelpNotification = notification?.startsWith("You wake up")

  const endTurn = useCallback(
    () =>
      setCurrentPlayer((currentPlayerState) =>
        currentPlayerState === Player.White ? Player.Black : Player.White
      ),
    []
  )

  const onSquareClick: RenderBoardProps["onSquareClick"] = ({
    square,
    squareState,
  }) => {
    if (battle) {
      notify("Finish the battle first!", setNotification)
      return
    }

    const [squarePlayer] = squareState

    if (!selectedSquare) {
      if (squarePlayer === currentPlayer) {
        setSelectedSquare(square)
        setNotification(undefined)
      }
      return
    }

    if (square === selectedSquare) {
      setSelectedSquare(undefined)
      return
    }

    const [nextSquarePlayer] = squareState
    const allowedFields = getReachableFields(selectedSquare, state)

    if (!allowedFields.includes(square)) {
      if (nextSquarePlayer === currentPlayer) {
        notify(
          "You cannot move to a square occupied by your own piece!",
          setNotification
        )
      } else {
        notify("This square is out of reach!", setNotification)
      }
      return
    }

    const [selectedX, selectedY] = selectedSquare.split(",").map(Number)
    const [targetX, targetY] = square.split(",").map(Number)
    const dx = targetX - selectedX
    const dy = targetY - selectedY

    if (isNaN(dx) || isNaN(dy)) {
      console.error("Invalid move: NaN detected in move calculations.")
      return
    }

    let jumpSquares: SquareId[] = []
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      for (let i = 1; i < Math.abs(dx); i++) {
        const jumpX = selectedX + (dx / Math.abs(dx)) * i
        const jumpY = selectedY + (dy / Math.abs(dy)) * i

        if (isNaN(jumpX) || isNaN(jumpY)) {
          console.error("Invalid jump calculation: NaN detected.")
          return
        }

        const jumpSquare = `${jumpX},${jumpY}` as SquareId
        jumpSquares.push(jumpSquare)
      }
    }

    // Filter out only the squares that contain opponent pieces
    const validJumpSquares = jumpSquares.filter(
      (jumpSquare) =>
        getPiece(state[jumpSquare])[0] &&
        getPiece(state[jumpSquare])[0] !== currentPlayer
    )

    if (validJumpSquares.length > 0) {
      Dusk.actions.removePiece({ squareIds: validJumpSquares })
    }

    setState((prevState) => {
      const nextState = { ...prevState } as BoardState
      delete nextState[selectedSquare]
      nextState[square] = prevState[selectedSquare]
      return nextState
    })

    Dusk.actions.movePiece({ squareId: selectedSquare, newSquareId: square })

    const nextMoves = getReachableFields(square, state, true)
    if (nextMoves.length > 0) {
      setSelectedSquare(square)
    } else {
      setSelectedSquare(undefined)
      endTurn()
    }
  }

  /* const onHelpClick = () => {
        notify(
            `You wake up in the middle of the forest. After opening your eyes you see a bunch of goblins around. They tell you they are going to teach you to play Chess. This is not a regular Chess game though. Since you are playing with Goblins the rules are a little bit different.
<br /><br />
- all pieces can move in any direction<br />
- pieces can not jump over other pieces<br />
- a piece can move the amount of squares equal to its power (see below)<br />
- if a piece moves to a square occupied by an opponent's piece, a battle starts<br />
- in battle mode you need to win "Rock Paper Scissors" to destroy the opponent's piece<br />
- castling does not work (too complicated for Goblins)<br />
- to win the game destroy the opponent's king<br />
- everything else acts as in regular Chess
<br /><br />
Pieces powers are:
<br />
${Object.entries(piecePower)
    .map(([piece, power]) => `${pieceName[piece as Piece]}: ${power}`)
    .join('<br />')}
<br /><br />
            `,
            setNotification
        )
    } */

  useEffect(() => {
    const pause = playBackgroundAudio({ loop: true })

    return () => {
      pause()
    }
  }, [playBackgroundAudio])

  useEffect(() => {
    Dusk.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setYourPlayerId(yourPlayerId)
        if (!yourPlayerId) {
          setCurrentPlayer(game.currentPlayer)
        } else {
          setCurrentPlayer(game.currentPlayer)
          setPlayer(game.players[yourPlayerId])
        }

        setState(game.board)
        setBattle(game.battle)
        setSelectedSquare(game.selectedSquare)
        setPlayerIds(game.playerIds || []) // Ensure playerIds is always an array

        setLastMovePlayerId(game.currentPlayer || null)

        if (game.notification) {
          setNotification(game.notification.message)
        }
      },
    })
  }, [])
  return (
    <div
      className={styles.root}
      style={{
        pointerEvents: player ? "all" : "none",
      }}
    >
      {(isGameStarted || isHelpNotification) && !!notification && (
        <div className={styles.modal}>
          <div className={styles.notification}>
            <p
              className={styles.notificationText}
              dangerouslySetInnerHTML={{
                __html: notification,
              }}
            />
            <button
              className={styles.button}
              type="button"
              onClick={() => {
                setNotification(undefined)
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/*  {!!player && (
                <img className={styles.helpButton} src={InfoIcon} alt="Help" title="Help" onClick={onHelpClick} />
            )}
            */}
      <div className={styles.gameName}>{gameName}</div>
      <div
        className={styles.boardWrapper}
        onClick={() => {
          if (!isMyTurn && !battle && isGameStarted) {
            notify("It is your opponent's turn!", setNotification)
          }
        }}
      >
        <div
          className={composeCssClass(
            styles.board,
            (!isMyTurn || !isGameStarted) && styles.boardDisabled
          )}
        >
          <RenderBoard
            state={state}
            selectedSquare={selectedSquare}
            onSquareClick={onSquareClick}
            battle={battle}
            currentPlayer={currentPlayer}
            player={player}
          />
        </div>
      </div>
      {!!player && !isGameStarted && !isHelpNotification && (
        <div className={styles.modal}>
          <div className={styles.gameStart}>
            <button
              className={styles.button}
              type="button"
              onClick={() => {
                setGameStarted(true)
              }}
            >
              Play
            </button>
          </div>
        </div>
      )}

      <ul id="playersSection">
        {playerIds.map((playerId, index) => {
          const player = Dusk.getPlayerInfo(playerId)
          const isWhiteTurn = lastMovePlayerId === "W"
          const isCurrentPlayerWhite = index === 0 // Assuming the first player is 'W'
          const shouldHighlight =
            (isWhiteTurn && isCurrentPlayerWhite) ||
            (!isWhiteTurn && !isCurrentPlayerWhite)

          return (
            <li
              key={playerId}
              data-player={index.toString()}
              style={{ opacity: shouldHighlight ? 1 : 0.5 }}
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
    </div>
  )
}

export default Game
