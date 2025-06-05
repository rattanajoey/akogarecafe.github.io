export const getKingMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  // Calculate all possible moves (1 square in any direction)
  const potentialMoves = [
    `${String.fromCharCode(col - 1)}${row - 1}`,
    `${String.fromCharCode(col)}${row - 1}`,
    `${String.fromCharCode(col + 1)}${row - 1}`,
    `${String.fromCharCode(col - 1)}${row}`,
    `${String.fromCharCode(col + 1)}${row}`,
    `${String.fromCharCode(col - 1)}${row + 1}`,
    `${String.fromCharCode(col)}${row + 1}`,
    `${String.fromCharCode(col + 1)}${row + 1}`,
  ];

  // Filter out moves that are off the board or blocked by friendly pieces
  return potentialMoves.filter((move) => {
    const [col, row] = [move[0], move[1]];
    if (col < "A" || col > "I" || row < "1" || row > "9") return false;

    const pieceAtPosition = pieces.find((p) => p.position === move);
    return !pieceAtPosition || pieceAtPosition.playerTwo !== isPlayerTwo;
  });
};
