export const getSilverGeneralMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0);
  const row = parseInt(position[1], 10);

  // Calculate all possible moves (1 space diagonally or forward)
  const potentialMoves = [
    `${String.fromCharCode(col - 1)}${row + 1}`, // Forward-left
    `${String.fromCharCode(col)}${row + 1}`, // Forward
    `${String.fromCharCode(col + 1)}${row + 1}`, // Forward-right
    `${String.fromCharCode(col - 1)}${row - 1}`, // Backward-left
    `${String.fromCharCode(col + 1)}${row - 1}`, // Backward-right
  ];

  // Filter out moves that are off the board or blocked
  return potentialMoves.filter((move) => {
    const [col, row] = [move[0], move[1]];
    return col >= "A" && col <= "I" && row >= "1" && row <= "9";
  });
};
