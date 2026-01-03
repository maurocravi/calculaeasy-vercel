import { round2 } from "../../utils";

export type OvertimeInput = {
  monthlyNominal: number;   // sueldo nominal mensual
  overtimeHours: number;    // horas extra trabajadas
  monthlyHours: number;     // horas mensuales estándar (default 192 o 200)
  surchargeRate: number;    // 0.50 o 1.00 (recargo)
};

export type OvertimeOutput = {
  hourlyRate: number;       // valor hora normal
  overtimeHourlyRate: number; // hora extra con recargo
  overtimePay: number;      // pago total horas extra
  notes: string[];
};

export function calculateOvertime(input: OvertimeInput): OvertimeOutput {
  const notes: string[] = [];

  const monthlyHours = input.monthlyHours > 0 ? input.monthlyHours : 192;

  const hourlyRate = round2(input.monthlyNominal / monthlyHours);
  const overtimeHourlyRate = round2(hourlyRate * (1 + input.surchargeRate));
  const overtimePay = round2(overtimeHourlyRate * input.overtimeHours);

  notes.push("El cálculo es estimativo y puede variar según convenio o empresa.");

  return {
    hourlyRate,
    overtimeHourlyRate,
    overtimePay,
    notes,
  };
}
