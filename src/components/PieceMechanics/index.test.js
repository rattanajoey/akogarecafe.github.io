import { getValidMoves } from "./index";
import { initialShogiPieces } from "../constants/InitialShogiPieces";

const piece = (name, position, playerTwo = false) => ({ id: 1, name, position, playerTwo });

test("the opposing gold general moves toward the bottom of the board", () => {
  expect(getValidMoves(piece("GoldGeneral", "E5", true), [], true).sort())
    .toEqual(["D4", "D5", "E4", "E6", "F4", "F5"]);
});

test("the opposing silver general has forward, rather than backward, straight movement", () => {
  expect(getValidMoves(piece("SilverGeneral", "E5", true), [], true).sort())
    .toEqual(["D4", "D6", "E4", "F4", "F6"]);
});

test.each(["Pawn", "King", "GoldGeneral", "SilverGeneral", "Knight", "Lance", "Bishop", "Rook", "PromotedPawn", "PromotedSilver", "PromotedKnight", "PromotedLance", "PromotedBishop", "PromotedRook"])(
  "%s stays on the board and produces each destination only once", (name) => {
    for (const playerTwo of [false, true]) {
      for (let col = 65; col <= 73; col++) {
        for (let row = 1; row <= 9; row++) {
          const moves = getValidMoves(piece(name, String.fromCharCode(col) + row, playerTwo), [], playerTwo);
          expect(moves.every(move => /^[A-I][1-9]$/.test(move))).toBe(true);
          expect(new Set(moves).size).toBe(moves.length);
        }
      }
    }
  }
);

test("a sliding piece stops at a friendly piece and after an enemy capture", () => {
  const rook = piece("Rook", "E5");
  const friendly = { ...piece("Pawn", "E7"), id: 2 };
  const enemy = { ...friendly, playerTwo: true };
  expect(getValidMoves(rook, [rook, friendly], false)).toContain("E6");
  expect(getValidMoves(rook, [rook, friendly], false)).not.toContain("E7");
  expect(getValidMoves(rook, [rook, enemy], false)).toContain("E7");
  expect(getValidMoves(rook, [rook, enemy], false)).not.toContain("E8");
});

test("the initial board does not allow jumping onto friendly pieces", () => {
  const knight = initialShogiPieces.find(p => p.position === "B1");
  expect(getValidMoves(knight, initialShogiPieces, false)).toEqual([]);
  const gold = initialShogiPieces.find(p => p.position === "D9");
  expect(getValidMoves(gold, initialShogiPieces, true).sort()).toEqual(["C8", "D8", "E8"]);
});
