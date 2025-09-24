namespace backend.Dto
{
    public class PaymentResponseDto
    {
        public int PaymentId { get; set; }
        public int RequestId { get; set; }
        public string? ReferenceNumber { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerName { get; set; } = string.Empty;
        public string? Device { get; set; } = string.Empty;
        public decimal? TotalAmount { get; set; }
        public decimal? AdvancedPayment { get; set; }
        public decimal? RemainingBalance { get; set; }
        public DateTime? PaymentDate { get; set; }
        public bool IsPaid { get; set; }
        public string RepairStatus { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
    }
}