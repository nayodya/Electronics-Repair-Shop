namespace backend.Dto
{
    public class PaymentStatisticsDto
    {
        public int TotalPayments { get; set; }
        public int PaidPayments { get; set; }
        public int PendingPayments { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal AveragePaymentAmount { get; set; }
        public decimal TotalAdvancedPayments { get; set; }
        public List<MonthlyPaymentDto> MonthlyPayments { get; set; } = new();
    }

    public class MonthlyPaymentDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int PaymentCount { get; set; }
    }
}