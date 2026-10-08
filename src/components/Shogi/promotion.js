import { promotionRules } from "../constants/InitialShogiPieces";

export const getPromotionForMove = (piece, destination) => {
  const rule = promotionRules[piece.name];
  if (!rule) return null;
  const zone = piece.playerTwo ? rule.playerTwoPromotionZone : rule.promotionZone;
  if (!zone.includes(piece.position) && !zone.includes(destination)) return null;
  const mandatoryZone = piece.playerTwo
    ? rule.playerTwoMandatoryPromotionZone
    : rule.mandatoryPromotionZone;
  return { rule, mandatory: Boolean(mandatoryZone?.includes(destination)) };
};
