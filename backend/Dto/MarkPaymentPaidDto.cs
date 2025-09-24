namespace backend.Dto
{
    public class MarkPaymentPaidDto
    {
        public DateTime? PaymentDate { get; set; } = DateTime.UtcNow;
    }
}