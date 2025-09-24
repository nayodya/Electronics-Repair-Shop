namespace backend.Dto
{
    public class PaymentFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public bool? IsPaid { get; set; }
        public int? RequestId { get; set; }
        public string? SortBy { get; set; } = "PaymentDate"; // PaymentDate, TotalAmount, RequestId
        public string? SortOrder { get; set; } = "DESC"; // ASC, DESC
        public int? PageNumber { get; set; } = 1;
        public int? PageSize { get; set; } = 50;
    }
}