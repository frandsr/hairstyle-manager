/**
 * Currency formatter for Argentine Pesos
 * Format: $ 1.400.000 (dot as thousands separator)
 */
export function formatCurrency(amount: number): string {
    // Use Spanish (Argentina) locale with ARS currency
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(value: string): number {
    // Remove currency symbol and dots, then parse
    const cleaned = value.replace(/[$.]/g, '').replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
}
