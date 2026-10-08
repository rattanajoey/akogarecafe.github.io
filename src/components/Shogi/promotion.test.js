import { getPromotionForMove } from "./promotion";

test.each([
  [{ name: "Rook", position: "A7" }, "A6"],
  [{ name: "Rook", position: "A3", playerTwo: true }, "A4"],
  [{ name: "SilverGeneral", position: "E6" }, "E7"],
])("promotion is offered on entering or leaving the zone", (piece, destination) => {
  expect(getPromotionForMove(piece, destination)?.mandatory).toBe(false);
});

test.each([
  [{ name: "Pawn", position: "E8" }, "E9"],
  [{ name: "Knight", position: "E6" }, "D8"],
  [{ name: "Lance", position: "E2", playerTwo: true }, "E1"],
  [{ name: "Knight", position: "E4", playerTwo: true }, "D2"],
])("pieces that would have no further moves must promote", (piece, destination) => {
  expect(getPromotionForMove(piece, destination)?.mandatory).toBe(true);
});

test("moves outside the zone and non-promotable pieces do not open the dialog", () => {
  expect(getPromotionForMove({ name: "Rook", position: "A5" }, "A6")).toBeNull();
  expect(getPromotionForMove({ name: "King", position: "E8" }, "E9")).toBeNull();
});
