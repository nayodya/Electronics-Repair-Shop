using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class RecordPaymentDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required]
    public required string Method { get; set; }

    public string? TransactionId { get; set; }
}