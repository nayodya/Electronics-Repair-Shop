using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

// Enum for the different states of a repair request
// Add to your RepairRequest model if not already present
public enum RepairStatus
{
    Received = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
    ReadyForDelivery = 4,
    Delivered = 5
}

// Model for the Repair Request
public class RepairRequest
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RequestId { get; set; }

    [Required]
    public string ReferenceNumber { get; set; } = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

    [Required]
    public int CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public User? Customer { get; set; }

    [Required]
    public string Device { get; set; }

    [Required]
    public string Brand { get; set; }

    [Required]
    public string Model { get; set; }

    [Required]
    public string Issue { get; set; }

    public string? Description { get; set; }

    [Required]
    public RepairStatus Status { get; set; } = RepairStatus.Received;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public int? EstimatedCompletionDays { get; set; }

    public int? TechnicianId { get; set; }
    [ForeignKey("TechnicianId")]
    public User? Technician { get; set; }
    
    public Payment? PaymentDetails { get; set; }

}