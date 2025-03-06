import { getPawnMoves } from "./Movement/PawnMovement";
import { getKingMoves } from "./Movement/KingMovement";
import { getGoldGeneralMoves } from "./Movement/GoldGeneralMovement";
import { getSilverGeneralMoves } from "./Movement/SilverGeneralMovement";
import { getKnightMoves } from "./Movement/KnightMovement";
import { getLanceMoves } from "./Movement/LanceMovement";
import { getBishopMoves } from "./Movement/BishopMovement";
import { getRookMoves } from "./Movement/RookMovement";
import { getPromotedPieceMoves } from "./Movement/PromotedPieceMovement";

const movementLogic = {
  Pawn: getPawnMoves,
  King: getKingMoves,
  OpposingKing: getKingMoves,
  GoldGeneral: getGoldGeneralMoves,
  SilverGeneral: getSilverGeneralMoves,
  Knight: getKnightMoves,
  Lance: getLanceMoves,
  Bishop: getBishopMoves,
  Rook: getRookMoves,
  PromotedPawn: getPromotedPieceMoves,
  PromotedSilver: getPromotedPieceMoves,
  PromotedKnight: getPromotedPieceMoves,
  PromotedLance: getPromotedPieceMoves,
  PromotedBishop: (position, pieces, isPlayerTwo) => [
    ...getBishopMoves(position, pieces),
    ...getKingMoves(position, pieces),
  ],
  PromotedRook: (position, pieces, isPlayerTwo) => [
    ...getRookMoves(position, pieces),
    ...getKingMoves(position, pieces),
  ],
};

export const getValidMoves = (piece, pieces, isPlayerTwo) => {
  const movementFn = movementLogic[piece.name];
  return movementFn ? movementFn(piece.position, pieces, isPlayerTwo) : [];
};
