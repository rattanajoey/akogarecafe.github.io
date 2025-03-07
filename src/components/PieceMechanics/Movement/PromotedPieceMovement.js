import { getGoldGeneralMoves } from "./GoldGeneralMovement";

export const getPromotedPieceMoves = (position, pieces, isPlayerTwo) => {
  return getGoldGeneralMoves(position, pieces, isPlayerTwo);
};
