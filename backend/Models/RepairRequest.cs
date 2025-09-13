using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

// Enum for the different states of a repair request
public enum RepairStatus
{
    Submitted,
    Received,
    Assigned,
    InProgress,
    Finished,
    ToDeliver,
    Delivered,
    Cancelled
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
    public RepairStatus Status { get; set; } = RepairStatus.Submitted;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public int? EstimatedCompletionDays { get; set; }

    public int? TechnicianId { get; set; }
    [ForeignKey("TechnicianId")]
    public User? Technician { get; set; }

    public Payment? PaymentDetails { get; set; }

}