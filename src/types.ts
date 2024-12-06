export interface Payment {
  date: string; // Дата платежа в формате ISO
  principal: bigint; // Основной долг в копейках
  interest: bigint; // Проценты в копейках
  total: bigint; // Общая сумма платежа в копейках
  remainingPrincipal: bigint; // Остаток основного долга в копейках
}

export interface CreditResult {
  totalPrincipal: bigint; // Общая сумма основного долга в копейках
  totalInterest: bigint; // Общая сумма процентов в копейках
  totalSum: bigint; // Общая сумма выплат в копейках
  payments: Payment[]; // Детализация платежей
}

export interface CreditOptions {
  percentRate: number; // Годовая процентная ставка
  term: number; // Срок кредита в месяцах
  creditSize: bigint; // Сумма кредита в копейках
  startDate: Date; // Начальная дата
}

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
