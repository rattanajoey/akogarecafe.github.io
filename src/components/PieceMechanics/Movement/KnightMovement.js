export const getKnightMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  // Determine direction based on player
  const direction = isPlayerTwo ? -1 : 1;

  // Calculate all possible moves (forward L-shape for Player One, backward L-shape for Player Two)
  const potentialMoves = [
    `${String.fromCharCode(col - 1)}${row + 2 * direction}`, // Left L
    `${String.fromCharCode(col + 1)}${row + 2 * direction}`, // Right L
  ];

  // Filter out moves that are off the board
  return potentialMoves.filter((move) => {
    const [col, row] = [move[0], move[1]];
    return col >= "A" && col <= "I" && row >= "1" && row <= "9";
  });
};
