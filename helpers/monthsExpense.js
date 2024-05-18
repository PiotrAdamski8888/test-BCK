const getMonthlyExpenseStats = (expenses, year) => {
  const monthStats = {
    January: "N/A",
    February: "N/A",
    March: "N/A",
    April: "N/A",
    May: "N/A",
    June: "N/A",
    July: "N/A",
    August: "N/A",
    September: "N/A",
    October: "N/A",
    November: "N/A",
    December: "N/A",
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  expenses.forEach((expense) => {
    const month = months[expense.date.month - 1];
    if (monthStats[month] === "N/A") {
      monthStats[month] = expense.amount;
    } else {
      monthStats[month] += expense.amount;
    }
  });

  return monthStats;
};

module.exports = { getMonthlyExpenseStats };
