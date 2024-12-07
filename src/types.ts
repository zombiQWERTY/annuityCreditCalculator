export interface ConvertedCreditResult {
  totalPrincipal: string; // Общая сумма основного долга в рублях
  totalInterest: string; // Общая сумма процентов в рублях
  totalSum: string; // Общая сумма выплат в рублях
  payments: {
    date: string;
    principal: string; // Основной долг в рублях
    interest: string; // Проценты в рублях
    total: string; // Общая сумма платежа в рублях
    remainingPrincipal: string; // Остаток основного долга в рублях
  }[];
}

export interface CreditOptions {
  percentRate: number; // годовая процентная ставка в процентах (например, 10 означает 10%)
  term: number; // срок кредита в месяцах (например, 12)
  creditSize: bigint; // сумма кредита в копейках
  startDate: Date; // дата выдачи кредита
}

export interface Payment {
  date: string; // дата платежа в формате YYYY-MM-DD
  principal: bigint; // сумма погашения основного долга за период
  interest: bigint; // сумма процентов за период
  total: bigint; // итоговая сумма платежа (principal + interest)
  remainingPrincipal: bigint; // остаток основного долга после платежа
}

export interface CreditResult {
  totalPrincipal: bigint; // общая сумма погашения основного долга
  totalInterest: bigint; // общая сумма уплаченных процентов
  totalSum: bigint; // общая сумма уплаченных средств (основной долг + проценты)
  payments: Payment[]; // массив платежей
}
