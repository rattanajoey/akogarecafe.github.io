export const getPawnMoves = (position, pieces, isPlayerTwo) => {
  const col = position.charCodeAt(0); // Column letter (A-I) to ASCII code
  const row = parseInt(position[1], 10); // Row number (1-9) to integer

  // Determine forward direction based on player
  const forwardRow = isPlayerTwo ? row - 1 : row + 1;

  // Check if the forward row is out of bounds
  if (forwardRow < 1 || forwardRow > 9) return [];

  const forwardPosition = `${String.fromCharCode(col)}${forwardRow}`;
  const isBlocked = pieces.some(piece => piece.position === forwardPosition);

  return isBlocked ? [] : [forwardPosition];
};
