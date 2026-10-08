export const getBishopMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  const moves = [];
  const directions = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1], // Diagonal directions
  ];

  directions.forEach(([dc, dr]) => {
    for (let i = 1; i < 9; i++) {
      const move = `${String.fromCharCode(col + dc * i)}${row + dr * i}`;
      if (move[0] < "A" || move[0] > "I" || Number(move.slice(1)) < 1 || Number(move.slice(1)) > 9)
        break;

      const pieceAtPosition = pieces.find((p) => p.position === move);
      if (pieceAtPosition) {
        // If the piece is an enemy piece, we can capture it
        if (Boolean(pieceAtPosition.playerTwo) !== Boolean(isPlayerTwo)) {
          moves.push(move);
        }
        break; // Stop in either case - can't move through pieces
      }
      moves.push(move);
    }
  });

  return moves;
};
