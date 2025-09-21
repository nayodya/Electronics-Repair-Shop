namespace backend.Dto
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalTechnicians { get; set; }
        public int TotalRepairs { get; set; }
        public int PendingRepairs { get; set; }
        public int InProgressRepairs { get; set; }
        public int CompletedRepairs { get; set; }
        public int ReadyForDeliveryRepairs { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
