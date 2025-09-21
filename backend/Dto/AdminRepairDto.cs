namespace backend.Dto
{
    public class AdminRepairDto
    {
        public int CustomerId { get; set; }
        public string Device { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Issue { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedCompletionDays { get; set; }
        public int? TechnicianId { get; set; }
        public decimal? EstimatedCost { get; set; }
    }
}