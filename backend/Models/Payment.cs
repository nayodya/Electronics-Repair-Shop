using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Payment
{
    public int PaymentId { get; set; }

    [Required]
    public int RepairRequestId { get; set; }

    [ForeignKey("RepairRequestId")]
    public RepairRequest? RepairRequest { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Method { get; set; } // e.g., "Credit Card", "Cash"

    [MaxLength(200)]
    public string? TransactionId { get; set; }

    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
}