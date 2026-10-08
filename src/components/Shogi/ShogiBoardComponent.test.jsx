import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShogiBoardComponent from "./ShogiBoardComponent";

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({ matches: false, media: query, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }));
});
const movePawn = (from, to) => {
  fireEvent.click(screen.getByRole("button", { name: `Player one Pawn at ${from}` }));
  fireEvent.click(screen.getByRole("button", { name: `Move to ${to}` }));
};
test("captures, declines optional promotion once, forces final-rank promotion, and resets", () => {
  render(<ShogiBoardComponent />);
  movePawn("A3", "A4");
  movePawn("A4", "A5");
  movePawn("A5", "A6");
  movePawn("A6", "A7");
  expect(screen.getByRole("dialog")).toHaveAccessibleName(/Promotion Opportunity/);
  fireEvent.click(screen.getByRole("button", { name: /Keep Original/ }));
  expect(screen.queryByRole("button", { name: "Player two Pawn at A7" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Player one Pawn at A7" })).toHaveLength(1);
  movePawn("A7", "A8");
  fireEvent.click(screen.getByRole("button", { name: /Keep Original/ }));
  movePawn("A8", "A9");
  expect(screen.getByRole("dialog")).toHaveAccessibleName(/Mandatory Promotion/);
  expect(screen.queryByRole("button", { name: /Keep Original/ })).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Promote/ }));
  expect(screen.getAllByRole("button", { name: "Player one Promoted Pawn at A9" })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Reset Shogi board" }));
  expect(screen.getByRole("button", { name: "Player one Pawn at A3" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Player two Lance at A9" })).toBeInTheDocument();
});
