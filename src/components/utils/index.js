// Calculate the position of each piece on the board
export const calculatePosition = (position) => {
  const col = position.charCodeAt(0) - 65; // Convert column letter (A-I) to index (0-8)
  const row = 9 - parseInt(position[1]); // Convert row number (1-9) to index (0-8)
  return { left: col * 50, top: row * 50 };
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getNextMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${month > 12 ? year + 1 : year}-${String(
    ((month - 1) % 12) + 1
  ).padStart(2, "0")}`;
};

export const getMonthNumber = (monthName) => {
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  return months[monthName] || "01";
};
