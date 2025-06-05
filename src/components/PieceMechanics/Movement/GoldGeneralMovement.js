export const getGoldGeneralMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  // Calculate all possible moves (1 space in any direction except back-diagonal)
  const potentialMoves = [
    `${String.fromCharCode(col - 1)}${row}`, // Left
    `${String.fromCharCode(col + 1)}${row}`, // Right
    `${String.fromCharCode(col)}${row + 1}`, // Forward
    `${String.fromCharCode(col - 1)}${row + 1}`, // Forward-left
    `${String.fromCharCode(col + 1)}${row + 1}`, // Forward-right
    `${String.fromCharCode(col)}${row - 1}`, // Backward
  ];

  // Filter out moves that are off the board or blocked by friendly pieces
  return potentialMoves.filter((move) => {
    const [col, row] = [move[0], move[1]];
    if (col < "A" || col > "I" || row < "1" || row > "9") return false;

    const pieceAtPosition = pieces.find((p) => p.position === move);
    return !pieceAtPosition || pieceAtPosition.playerTwo !== isPlayerTwo;
  });
};
