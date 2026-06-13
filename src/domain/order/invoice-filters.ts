export type InvoicePeriod = "day" | "week" | "month" | "year";

export type InvoiceFilterValues = {
  period: InvoicePeriod;
  date: string;
  weekFrom: string;
  weekTo: string;
  month: string;
  year: string;
  dateFrom: string;
  dateTo: string;
};

export type InvoiceFilterInput = {
  period?: string | null;
  date?: string | null;
  weekFrom?: string | null;
  weekTo?: string | null;
  month?: string | null;
  year?: string | null;
};

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMonth(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseYear(value?: string | null) {
  if (!value || !/^\d{4}$/.test(value)) return null;
  const year = Number(value);
  if (year < 2020 || year > 2100) return null;
  return year;
}

export function parseInvoicePeriod(value?: string | null): InvoicePeriod {
  if (value === "week" || value === "month" || value === "year") return value;
  return "day";
}

export function getInvoiceFilterValues(input: InvoiceFilterInput = {}, now = new Date()): InvoiceFilterValues {
  const period = parseInvoicePeriod(input.period);
  const today = toDateString(now);
  const anchorDate = parseDate(input.date) ?? now;
  const selectedDate = toDateString(anchorDate);
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = input.month && parseMonth(input.month) ? input.month : currentMonth;
  const selectedYear = String(parseYear(input.year) ?? now.getFullYear());

  if (period === "week") {
    const fromDate = parseDate(input.weekFrom);
    const toDate = parseDate(input.weekTo);

    if (fromDate && toDate && fromDate <= toDate) {
      return {
        period,
        date: selectedDate,
        weekFrom: toDateString(fromDate),
        weekTo: toDateString(toDate),
        month: selectedMonth,
        year: selectedYear,
        dateFrom: toDateString(fromDate),
        dateTo: toDateString(toDate),
      };
    }

    const start = new Date(anchorDate);
    const day = anchorDate.getDay() || 7;
    start.setDate(anchorDate.getDate() - day + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      period,
      date: selectedDate,
      weekFrom: toDateString(start),
      weekTo: toDateString(end),
      month: selectedMonth,
      year: selectedYear,
      dateFrom: toDateString(start),
      dateTo: toDateString(end),
    };
  }

  if (period === "month") {
    const start = parseMonth(selectedMonth) ?? now;
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1, 0);

    return {
      period,
      date: selectedDate,
      weekFrom: today,
      weekTo: today,
      month: selectedMonth,
      year: selectedYear,
      dateFrom: toDateString(start),
      dateTo: toDateString(end),
    };
  }

  if (period === "year") {
    const year = Number(selectedYear);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    return {
      period,
      date: selectedDate,
      weekFrom: today,
      weekTo: today,
      month: selectedMonth,
      year: selectedYear,
      dateFrom: toDateString(start),
      dateTo: toDateString(end),
    };
  }

  return {
    period,
    date: selectedDate,
    weekFrom: today,
    weekTo: today,
    month: selectedMonth,
    year: selectedYear,
    dateFrom: selectedDate,
    dateTo: selectedDate,
  };
}

export function buildInvoiceFilterQuery(status: string, values: InvoiceFilterValues, overridePeriod?: InvoicePeriod) {
  const period = overridePeriod ?? values.period;
  const params = new URLSearchParams({
    status,
    period,
  });

  if (period === "day") {
    params.set("date", values.date);
  } else if (period === "week") {
    params.set("weekFrom", values.weekFrom);
    params.set("weekTo", values.weekTo);
  } else if (period === "month") {
    params.set("month", values.month);
  } else {
    params.set("year", values.year);
  }

  return params.toString();
}
