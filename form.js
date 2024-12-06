const holidays = [
  "2024-01-01",
  "2024-01-02",
  "2024-01-03",
  "2024-01-04",
  "2024-01-05",
  "2024-01-06",
  "2024-01-07",
  "2024-01-08",
  "2024-01-13",
  "2024-01-14",
  "2024-01-20",
  "2024-01-21",
  "2024-01-27",
  "2024-01-28",
  "2024-02-03",
  "2024-02-04",
  "2024-02-10",
  "2024-02-11",
  "2024-02-17",
  "2024-02-18",
  "2024-02-23",
  "2024-02-24",
  "2024-02-25",
  "2024-03-02",
  "2024-03-03",
  "2024-03-08",
  "2024-03-09",
  "2024-03-10",
  "2024-03-16",
  "2024-03-17",
  "2024-03-23",
  "2024-03-24",
  "2024-03-30",
  "2024-03-31",
  "2024-04-06",
  "2024-04-07",
  "2024-04-13",
  "2024-04-14",
  "2024-04-20",
  "2024-04-21",
  "2024-04-28",
  "2024-04-29",
  "2024-04-30",
  "2024-05-01",
  "2024-05-04",
  "2024-05-05",
  "2024-05-09",
  "2024-05-10",
  "2024-05-11",
  "2024-05-12",
  "2024-05-18",
  "2024-05-19",
  "2024-05-25",
  "2024-05-26",
  "2024-06-01",
  "2024-06-02",
  "2024-06-08",
  "2024-06-09",
  "2024-06-12",
  "2024-06-15",
  "2024-06-16",
  "2024-06-22",
  "2024-06-23",
  "2024-06-29",
  "2024-06-30",
  "2024-07-06",
  "2024-07-07",
  "2024-07-13",
  "2024-07-14",
  "2024-07-20",
  "2024-07-21",
  "2024-07-27",
  "2024-07-28",
  "2024-08-03",
  "2024-08-04",
  "2024-08-10",
  "2024-08-11",
  "2024-08-17",
  "2024-08-18",
  "2024-08-24",
  "2024-08-25",
  "2024-08-31",
  "2024-09-01",
  "2024-09-07",
  "2024-09-08",
  "2024-09-14",
  "2024-09-15",
  "2024-09-21",
  "2024-09-22",
  "2024-09-28",
  "2024-09-29",
  "2024-10-05",
  "2024-10-06",
  "2024-10-12",
  "2024-10-13",
  "2024-10-19",
  "2024-10-20",
  "2024-10-26",
  "2024-10-27",
  "2024-11-03",
  "2024-11-04",
  "2024-11-09",
  "2024-11-10",
  "2024-11-16",
  "2024-11-17",
  "2024-11-23",
  "2024-11-24",
  "2024-11-30",
  "2024-12-01",
  "2024-12-07",
  "2024-12-08",
  "2024-12-14",
  "2024-12-15",
  "2024-12-21",
  "2024-12-22",
  "2024-12-29",
  "2024-12-30",
  "2024-12-31",
];

document
  .getElementById("calculatorForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const percentRate = parseFloat(
      document.getElementById("percentRate").value,
    );
    const term = parseInt(document.getElementById("term").value, 10);
    const creditSize =
      BigInt(document.getElementById("creditSize").value) * BigInt(100); // Рубли в копейки
    const startDate = new Date(document.getElementById("startDate").value);

    const options = {
      percentRate,
      term,
      creditSize,
      startDate,
    };

    try {
      const calculator = new window.AnnuityCreditCalculator({
        ...options,
        holidays,
      });
      const result = calculator.calculate();

      displayResults(result);
    } catch (error) {
      alert("Ошибка: " + error.message);
    }
  });

function displayResults(result) {
  const totalResult = document.getElementById("totalResult");
  const paymentTableBody = document
    .getElementById("paymentTable")
    .querySelector("tbody");

  totalResult.innerHTML = `
    Общая сумма: ${(Number(result.totalSum) / 100).toFixed(2)} руб.<br>
    Общие проценты: ${(Number(result.totalInterest) / 100).toFixed(2)} руб.<br>
    Основной долг: ${(Number(result.totalPrincipal) / 100).toFixed(2)} руб.
  `;

  paymentTableBody.innerHTML = "";
  result.payments.forEach((payment) => {
    const row = document.createElement("tr");
    const formattedDate = new Date(payment.date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${(Number(payment.total) / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 })} руб.</td>
      <td>${(Number(payment.principal) / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 })} руб.</td>
      <td>${(Number(payment.interest) / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 })} руб.</td>
      <td>${(Number(payment.remainingPrincipal) / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 })} руб.</td>
    `;
    paymentTableBody.appendChild(row);
  });
}
