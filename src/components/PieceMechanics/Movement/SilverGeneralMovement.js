export const getSilverGeneralMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);
  const direction = isPlayerTwo ? -1 : 1;

  // Calculate all possible moves (1 space diagonally or forward)
  const potentialMoves = [
    `${String.fromCharCode(col - 1)}${row + direction}`, // Forward-left
    `${String.fromCharCode(col)}${row + direction}`, // Forward
    `${String.fromCharCode(col + 1)}${row + direction}`, // Forward-right
    `${String.fromCharCode(col - 1)}${row - direction}`, // Backward-left
    `${String.fromCharCode(col + 1)}${row - direction}`, // Backward-right
  ];

  // Filter out moves that are off the board or blocked by friendly pieces
  return potentialMoves.filter((move) => {
    const [col, row] = [move[0], Number(move.slice(1))];
    if (col < "A" || col > "I" || row < 1 || row > 9) return false;

    const pieceAtPosition = pieces.find((p) => p.position === move);
    return !pieceAtPosition || Boolean(pieceAtPosition.playerTwo) !== Boolean(isPlayerTwo);
  });
};
