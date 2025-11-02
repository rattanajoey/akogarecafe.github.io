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
  PromotedBishop: (position, pieces, isPlayerTwo) => {
    const bishopMoves = getBishopMoves(position, pieces, isPlayerTwo);
    const kingMoves = getKingMoves(position, pieces, isPlayerTwo);
    return [...bishopMoves, ...kingMoves];
  },
  PromotedRook: (position, pieces, isPlayerTwo) => {
    const rookMoves = getRookMoves(position, pieces, isPlayerTwo);
    const kingMoves = getKingMoves(position, pieces, isPlayerTwo);
    return [...rookMoves, ...kingMoves];
  },
};

export const getValidMoves = (piece, pieces, isPlayerTwo) => {
  const movementFn = movementLogic[piece.name];
  return movementFn ? movementFn(piece.position, pieces, isPlayerTwo) : [];
};
