import { ConvertedCreditResult, CreditResult } from "./types";

export class RublesConverter {
  /**
   * Преобразует сумму из копеек в рубли с округлением по математическим правилам.
   * @param value Сумма в копейках (bigint)
   * @returns Сумма в рублях (строка)
   */
  private static formatRubles(value: bigint): string {
    const rubles = Number(value) / 100;
    return rubles.toFixed(2); // Округление до двух знаков после запятой
  }

  /**
   * Преобразует объект `CreditResult` из копеек в рубли.
   * Все суммы в объекте, включая платежи, преобразуются в рубли.
   * @param result Объект `CreditResult` с суммами в копейках
   * @returns Объект `ConvertedCreditResult` с суммами в рублях
   */
  public static convert(result: CreditResult): ConvertedCreditResult {
    return {
      totalPrincipal: RublesConverter.formatRubles(result.totalPrincipal),
      totalInterest: RublesConverter.formatRubles(result.totalInterest),
      totalSum: RublesConverter.formatRubles(result.totalSum),
      payments: result.payments.map((payment) => ({
        date: payment.date,
        principal: RublesConverter.formatRubles(payment.principal),
        interest: RublesConverter.formatRubles(payment.interest),
        total: RublesConverter.formatRubles(payment.total),
        remainingPrincipal: RublesConverter.formatRubles(
          payment.remainingPrincipal,
        ),
      })),
    };
  }
}
