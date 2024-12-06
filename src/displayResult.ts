import { ConvertedCreditResult } from "./types";
import { format, parseISO } from "date-fns";

/**
 * Отображает результат в виде таблицы с заголовками.
 * @param result Объект `ConvertedCreditResult` с суммами в рублях
 */
export function displayResultAsTable(result: ConvertedCreditResult): void {
  console.log("Общая сумма основного долга (руб.):", result.totalPrincipal);
  console.log("Общая сумма процентов (руб.):", result.totalInterest);
  console.log("Общая сумма выплат (руб.):", result.totalSum);
  console.log("");

  // Заголовки таблицы
  const headers = [
    "Дата",
    "Платеж (руб.)",
    "Основной долг (руб.)",
    "Проценты (руб.)",
    "Остаток (руб.)",
  ];

  // Формируем строки таблицы
  const rows = result.payments.map((payment) => [
    format(parseISO(payment.date), "dd.MM.yyyy"), // Форматирование даты
    payment.total,
    payment.principal,
    payment.interest,
    payment.remainingPrincipal,
  ]);

  // Вычисляем ширину каждой колонки
  const columnWidths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].toString().length)),
  );

  // Функция для форматирования строки
  const formatRow = (row: string[]): string =>
    row.map((cell, i) => cell.padEnd(columnWidths[i], " ")).join(" | ");

  // Вывод заголовков
  console.log(formatRow(headers));
  console.log(
    "-".repeat(columnWidths.reduce((sum, width) => sum + width + 3, -3)),
  );

  // Вывод строк таблицы
  rows.forEach((row) => console.log(formatRow(row)));
}
