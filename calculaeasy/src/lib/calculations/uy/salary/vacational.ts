import { round2 } from "../../utils";

export type VacationalInput = {
  monthlyNominal: number; // sueldo nominal mensual
  vacationDays: number;   // días de licencia
  monthDaysDivisor: number; // divisor para salario diario (default 30)
};

export type VacationalOutput = {
  dailyRate: number;
  vacationalPay: number;
  notes: string[];
};

export function calculateVacational(input: VacationalInput): VacationalOutput {
  const notes: string[] = [];

  const divisor = input.monthDaysDivisor > 0 ? input.monthDaysDivisor : 30;
  const dailyRate = round2(input.monthlyNominal / divisor);
  const vacationalPay = round2(dailyRate * input.vacationDays);

  notes.push("El cálculo es estimativo y puede variar según régimen laboral y convenios.");

  return {
    dailyRate,
    vacationalPay,
    notes,
  };
}
