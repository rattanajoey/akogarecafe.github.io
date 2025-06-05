export const getLanceMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  const moves = [];
  const direction = isPlayerTwo ? -1 : 1; // Determine direction based on player

  for (let r = row + direction; r >= 1 && r <= 9; r += direction) {
    const move = `${String.fromCharCode(col)}${r}`;
    const pieceAtPosition = pieces.find((p) => p.position === move);

    if (pieceAtPosition) {
      // If the piece is an enemy piece, we can capture it
      if (pieceAtPosition.playerTwo !== isPlayerTwo) {
        moves.push(move);
      }
      break; // Stop in either case - can't move through pieces
    }
    moves.push(move);
  }

  return moves;
};
