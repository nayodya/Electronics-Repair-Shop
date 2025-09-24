using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class CreatePaymentDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0")]
        public decimal TotalAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Advanced payment cannot be negative")]
        public decimal? AdvancedPayment { get; set; }

        public DateTime? PaymentDate { get; set; }
    }
}