import { toDate } from "date-fns-tz";

import {
  isSaturday,
  isSunday,
  addDays,
  format,
  isLeapYear,
  addMonths,
} from "date-fns";
import { CreditOptions, CreditResult, Payment } from "./types";

export class AnnuityCreditCalculator {
  private readonly percentRate: number; // Годовая процентная ставка
  private readonly term: number; // Срок кредита в месяцах
  private readonly creditSize: bigint; // Сумма кредита в копейках
  private readonly startDate: Date; // Начальная дата
  private timezone: string = "Europe/Moscow"; // Часовой пояс Москвы
  private holidays: string[]; // Список праздничных дней

  constructor(options: CreditOptions & { holidays?: string[] }) {
    const { percentRate, term, creditSize, startDate, holidays = [] } = options;
    this.percentRate = percentRate;
    this.term = term - 1;
    this.creditSize = creditSize;
    this.startDate = startDate;
    this.holidays = holidays;

    this.validateInputs();
  }

  private validateInputs(): void {
    if (this.percentRate <= 0) {
      throw new Error("Percent rate must be greater than 0.");
    }

    if (this.term <= 0 || !Number.isInteger(this.term)) {
      throw new Error("Term must be a positive integer.");
    }

    if (this.creditSize <= BigInt(0)) {
      throw new Error("Credit size must be greater than 0.");
    }

    if (!(this.startDate instanceof Date) || isNaN(this.startDate.getTime())) {
      throw new Error("Invalid start date provided.");
    }
  }

  private calculateMonthlyRate(): number {
    return this.percentRate / 12 / 100; // Месячная ставка в виде десятичной дроби
  }

  private calculateAnnuityCoefficient(monthlyRate: number): number {
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, this.term);
    const denominator = Math.pow(1 + monthlyRate, this.term) - 1;
    return numerator / denominator;
  }

  private adjustPaymentDate(date: Date): Date {
    let adjustedDate = date;

    // Перенос на следующий рабочий день, если дата приходится на выходной или праздник
    while (
      isSaturday(adjustedDate) ||
      isSunday(adjustedDate) ||
      this.isHoliday(adjustedDate)
    ) {
      adjustedDate = addDays(adjustedDate, 1);
    }

    return adjustedDate;
  }

  private isHoliday(date: Date): boolean {
    const formattedDate = format(date, "yyyy-MM-dd");
    return this.holidays.includes(formattedDate);
  }

  private daysInMonth(date: Date): number {
    const month = date.getMonth() + 1; // January is 0
    if (month === 2) {
      // February
      return isLeapYear(date) ? 29 : 28;
    }

    // Months with 30 days
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }

    return 31;
  }

  public calculate(): CreditResult {
    const monthlyRate = this.calculateMonthlyRate();

    // Рассчитываем ежемесячный аннуитетный платёж в копейках
    const annuityCoefficient = this.calculateAnnuityCoefficient(monthlyRate);
    const monthlyPayment = this.calculateMonthlyPayment(annuityCoefficient);

    let remainingPrincipal = this.creditSize;
    const payments: Payment[] = [];

    const firstPayment = this.calculateFirstPayment(
      this.startDate,
      remainingPrincipal,
    );

    payments.push(firstPayment);

    let prevPaymentDate = firstPayment.dateRaw;

    // Платежи начиная со второго месяца
    for (let i = 1; i < this.term; i++) {
      const intermediatePayment = this.calculateIntermediatePayment(
        i,
        prevPaymentDate,
        monthlyPayment,
        remainingPrincipal,
      );

      // Уменьшаем остаток основного долга
      remainingPrincipal = intermediatePayment.remainingPrincipal;

      payments.push(intermediatePayment);

      prevPaymentDate = intermediatePayment.dateRaw;
    }

    const lastPayment = this.calculateLastPayment(
      prevPaymentDate,
      remainingPrincipal,
    );

    payments.push(lastPayment);

    const totalPrincipal = payments.reduce(
      (sum, p) => sum + p.principal,
      BigInt(0),
    );

    const totalInterest = payments.reduce(
      (sum, p) => sum + p.interest,
      BigInt(0),
    );
    const totalSum = payments.reduce((sum, p) => sum + p.total, BigInt(0));

    return {
      totalPrincipal,
      totalInterest,
      totalSum,
      payments,
    };
  }

  // Метод для расчета аннуитетного платежа
  private calculateMonthlyPayment(annuityCoefficient: number): number {
    return Math.round(Number(this.creditSize) * annuityCoefficient);
  }

  private calculateFirstPayment(
    startDate: Date,
    remainingPrincipal: bigint,
  ): Payment & { dateRaw: Date } {
    // Дата первого платежа через месяц после начала кредита
    let paymentDateUnadjusted = toDate(addMonths(startDate, 1), {
      timeZone: this.timezone,
    });

    // Рассчитываем разницу в днях между начальной датой и предполагаемой датой первого платежа
    const daysToNextPayment = Math.ceil(
      (paymentDateUnadjusted.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Добавляем это количество дней к начальной дате
    paymentDateUnadjusted = toDate(addDays(startDate, daysToNextPayment), {
      timeZone: this.timezone,
    });

    // Корректируем дату на рабочий день
    const paymentDateAdjusted = this.adjustPaymentDate(paymentDateUnadjusted);

    // Первый платёж: только проценты
    const interest = this.calculateInterest(
      startDate,
      paymentDateUnadjusted,
      remainingPrincipal,
    );

    return {
      date: format(paymentDateAdjusted, "yyyy-MM-dd"),
      dateRaw: paymentDateUnadjusted,
      principal: BigInt(0), // В первый месяц основной долг не погашается
      interest: interest,
      total: interest, // Общий платёж = только проценты
      remainingPrincipal,
    };
  }

  // Метод для расчета промежуточного платежа
  private calculateIntermediatePayment(
    i: number,
    prevPaymentDate: Date,
    monthlyPayment: number,
    remainingPrincipal: bigint,
  ): Payment & { dateRaw: Date } {
    // Вычисляем дату платежа
    const paymentDateUnadjusted = toDate(addMonths(this.startDate, i + 1), {
      timeZone: this.timezone,
    });

    // Корректируем только дату платежа, если она попадает на выходной или праздник
    const paymentDateAdjusted = this.adjustPaymentDate(paymentDateUnadjusted);
    const formattedDate = format(paymentDateAdjusted, "yyyy-MM-dd");

    // Проценты за текущий месяц
    const interest = this.calculateInterest(
      prevPaymentDate,
      paymentDateUnadjusted,
      remainingPrincipal,
    );

    // Основной долг за текущий месяц
    const principalPayment = BigInt(monthlyPayment) - interest;

    return {
      date: formattedDate,
      dateRaw: paymentDateUnadjusted,
      principal: principalPayment,
      interest: interest,
      total: BigInt(monthlyPayment),
      remainingPrincipal: remainingPrincipal - principalPayment,
    };
  }

  // Метод для расчета последнего платежа
  private calculateLastPayment(
    prevPaymentDate: Date,
    remainingPrincipal: bigint,
  ): Payment {
    const paymentDateUnadjusted = toDate(addMonths(prevPaymentDate, 1), {
      timeZone: this.timezone,
    });

    const paymentDateAdjusted = this.adjustPaymentDate(paymentDateUnadjusted);

    const formattedDate = format(paymentDateAdjusted, "yyyy-MM-dd");

    // Проценты за текущий месяц
    const interest = this.calculateInterest(
      prevPaymentDate,
      paymentDateUnadjusted,
      remainingPrincipal,
    );

    return {
      date: formattedDate,
      principal: remainingPrincipal,
      interest,
      total: remainingPrincipal + interest,
      remainingPrincipal: BigInt(0),
    };
  }

  private calculateInterest(
    prevPaymentDate: Date,
    paymentDate: Date,
    remainingPrincipal: bigint,
  ): bigint {
    const prevYear = prevPaymentDate.getFullYear();
    const currentYear = paymentDate.getFullYear();

    let interestPayment = BigInt(0);

    if (prevYear !== currentYear) {
      // Если перескакиваем на следующий год
      const lastDayOfPrevYear = new Date(prevYear, 11, 31); // 31 декабря предыдущего года

      // Количество дней в предыдущем году
      const daysInYearPrev = isLeapYear(prevPaymentDate) ? 366 : 365;
      const daysInPrevYear = Math.ceil(
        (lastDayOfPrevYear.getTime() - prevPaymentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const interestPrevYear = BigInt(
        Math.round(
          Number(remainingPrincipal) *
            (this.percentRate / 100 / daysInYearPrev) *
            daysInPrevYear,
        ),
      );

      // Количество дней в текущем году
      const daysInYearCurrent = isLeapYear(paymentDate) ? 366 : 365;
      const daysInCurrentYear = Math.ceil(
        (paymentDate.getTime() - new Date(currentYear, 0, 1).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const interestCurrentYear = BigInt(
        Math.round(
          Number(remainingPrincipal) *
            (this.percentRate / 100 / daysInYearCurrent) *
            daysInCurrentYear,
        ),
      );

      // Суммируем проценты за оба периода
      interestPayment = interestPrevYear + interestCurrentYear;
    } else {
      // Если в пределах одного года
      const daysInYear = isLeapYear(prevPaymentDate) ? 366 : 365;
      const daysInPrevMonth = this.daysInMonth(prevPaymentDate);

      interestPayment = BigInt(
        Math.round(
          Number(remainingPrincipal) *
            (this.percentRate / 100 / daysInYear) *
            daysInPrevMonth,
        ),
      );
    }

    return interestPayment;
  }
}

// @ts-ignore
window.AnnuityCreditCalculator = AnnuityCreditCalculator;
