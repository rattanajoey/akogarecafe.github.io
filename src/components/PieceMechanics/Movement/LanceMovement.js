export const getLanceMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  const moves = [];
  const direction = isPlayerTwo ? -1 : 1; // Determine direction based on player

  for (let r = row + direction; r >= 1 && r <= 9; r += direction) {
    const move = `${String.fromCharCode(col)}${r}`;
    if (pieces.some((piece) => piece.position === move)) break;
    moves.push(move);
  }

  return moves;
};
