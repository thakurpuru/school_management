const gradeOrder = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12"
];

export const getNextClass = (className) => {
  const index = gradeOrder.findIndex(
    (value) => value.toLowerCase() === String(className).toLowerCase()
  );

  if (index === -1 || index === gradeOrder.length - 1) {
    return className;
  }

  return gradeOrder[index + 1];
};
