 export const initialShogiPieces = [
    // Player 1 (Bottom)
    { id: 1, name: 'Lance', position: 'A1', image: '/pieces/Kyosha.svg' },
    { id: 2, name: 'Knight', position: 'B1', image: '/pieces/Keima.svg' },
    { id: 3, name: 'SilverGeneral', position: 'C1', image: '/pieces/Ginsho.svg' },
    { id: 4, name: 'GoldGeneral', position: 'D1', image: '/pieces/Kinsho.svg' },
    { id: 5, name: 'King', position: 'E1', image: '/pieces/Osho.svg' },
    { id: 6, name: 'GoldGeneral', position: 'F1', image: '/pieces/Kinsho.svg' },
    { id: 7, name: 'SilverGeneral', position: 'G1', image: '/pieces/Ginsho.svg' },
    { id: 8, name: 'Knight', position: 'H1', image: '/pieces/Keima.svg' },
    { id: 9, name: 'Lance', position: 'I1', image: '/pieces/Kyosha.svg' },
  
    // Second Row (Player 1)
    { id: 10, name: 'Bishop', position: 'B2', image: '/pieces/Kakugyuo.svg' },
    { id: 11, name: 'Rook', position: 'H2', image: '/pieces/Hisha.svg' },
  
    // Third Row (Player 1)
    { id: 12, name: 'Pawn', position: 'A3', image: '/pieces/Fuhyo.svg' },
    { id: 13, name: 'Pawn', position: 'B3', image: '/pieces/Fuhyo.svg' },
    { id: 14, name: 'Pawn', position: 'C3', image: '/pieces/Fuhyo.svg' },
    { id: 15, name: 'Pawn', position: 'D3', image: '/pieces/Fuhyo.svg' },
    { id: 16, name: 'Pawn', position: 'E3', image: '/pieces/Fuhyo.svg' },
    { id: 17, name: 'Pawn', position: 'F3', image: '/pieces/Fuhyo.svg' },
    { id: 18, name: 'Pawn', position: 'G3', image: '/pieces/Fuhyo.svg' },
    { id: 19, name: 'Pawn', position: 'H3', image: '/pieces/Fuhyo.svg' },
    { id: 20, name: 'Pawn', position: 'I3', image: '/pieces/Fuhyo.svg' },
  
    // Player 2 (Top)
    { id: 21, name: 'Lance', position: 'A9', image: '/pieces/Kyosha.svg', playerTwo: true },
    { id: 22, name: 'Knight', position: 'B9', image: '/pieces/Keima.svg', playerTwo: true },
    { id: 23, name: 'SilverGeneral', position: 'C9', image: '/pieces/Ginsho.svg', playerTwo: true },
    { id: 24, name: 'GoldGeneral', position: 'D9', image: '/pieces/Kinsho.svg', playerTwo: true },
    { id: 25, name: 'OpposingKing', position: 'E9', image: '/pieces/Gyokusho.svg', playerTwo: true },
    { id: 26, name: 'GoldGeneral', position: 'F9', image: '/pieces/Kinsho.svg', playerTwo: true },
    { id: 27, name: 'SilverGeneral', position: 'G9', image: '/pieces/Ginsho.svg', playerTwo: true },
    { id: 28, name: 'Knight', position: 'H9', image: '/pieces/Keima.svg', playerTwo: true },
    { id: 29, name: 'Lance', position: 'I9', image: '/pieces/Kyosha.svg', playerTwo: true },
  
    // Second Row (Player 2)
    { id: 30, name: 'Bishop', position: 'B8', image: '/pieces/Kakugyuo.svg', playerTwo: true },
    { id: 31, name: 'Rook', position: 'H8', image: '/pieces/Hisha.svg', playerTwo: true },
  
    // Third Row (Player 2)
    { id: 32, name: 'Pawn', position: 'A7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 33, name: 'Pawn', position: 'B7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 34, name: 'Pawn', position: 'C7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 35, name: 'Pawn', position: 'D7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 36, name: 'Pawn', position: 'E7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 37, name: 'Pawn', position: 'F7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 38, name: 'Pawn', position: 'G7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 39, name: 'Pawn', position: 'H7', image: '/pieces/Fuhyo.svg', playerTwo: true },
    { id: 40, name: 'Pawn', position: 'I7', image: '/pieces/Fuhyo.svg', playerTwo: true },
  ];
  
  export const pieceInfo = {
    King: { englishName: 'King', name: 'Osho 王將', description: 'A king can move one square in any direction.' },
    OpposingKing: { englishName: 'Opposing King 玉將', name: 'Gyokusho', description: 'Same as a King.' },
    GoldGeneral: { englishName:'Gold General', name: 'Kinsho 金将', description: 'A gold general can move one square in any direction except diagonally back.' },
    SilverGeneral: { englishName: 'Silver General', name: 'Ginsho 銀将', description: 'A silver general can move one square diagonally any direction or one space forward.' },
    Knight: { englishName:'Knight', name: 'Keima 桂馬', description: 'A knight can jump one square forward, plus one square diagonally forward. It is the only piece allowed to jump other pieces in its path.' },
    Lance: { englishName:'Lance', name: 'Kyosha 香車', description: 'A lance can move any number of free squares directly forward. It cannot move in any other direction.' },
    Bishop: { englishName:'Bishop', name: 'Kakugyuo 角行', description: 'A bishop can move any number of free squares in any diagonal direction.' },
    Rook: { englishName:'Rook', name: 'Hisha 飛車', description: 'A rook can move any number of free squares forward, backward, left or right.' },
    Pawn: { englishName:'Pawn',name: 'Fuhyo 歩兵', description: 'A pawn can only move one square forward.' }
  };