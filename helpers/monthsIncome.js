const getMonthlyIncomeStats = (incomes, year) => {
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

  incomes.forEach((income) => {
    const month = new Date(
      income.date.year,
      income.date.month - 1,
      income.date.day
    ).toLocaleString("default", { month: "long" });
    if (monthStats[month] === "N/A") {
      monthStats[month] = income.amount;
    } else {
      monthStats[month] += income.amount;
    }
  });

  return monthStats;
};

module.exports = { getMonthlyIncomeStats };
