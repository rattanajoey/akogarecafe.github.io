export const getBishopMoves = (position, pieces) => {
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
      if (move[0] < "A" || move[0] > "I" || move[1] < "1" || move[1] > "9")
        break;
      if (pieces.some((piece) => piece.position === move)) break;
      moves.push(move);
    }
  });

  return moves;
};
