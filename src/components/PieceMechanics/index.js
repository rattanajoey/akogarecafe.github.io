import { getPawnMoves } from './Movement/PawnMovement';
import { getKingMoves } from './Movement/KingMovement';
// Map piece types to their movement logic
const movementLogic = {
  Pawn: getPawnMoves,
  King: getKingMoves,
  // Add other pieces here
};

// Dispatcher function to get valid moves for a given piece
export const getValidMoves = (piece, pieces, isPlayerTwo) => {
  const movementFn = movementLogic[piece.name];
  return movementFn ? movementFn(piece.position, pieces, isPlayerTwo) : [];
};
