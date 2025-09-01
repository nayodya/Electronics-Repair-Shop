using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class RepairRequest
{
    public int RepairRequestId { get; set; }

    [Required]
    [MaxLength(50)]
    public required string ReferenceNumber { get; set; }

    [Required]
    public int UserId { get; set; } // Customer who owns the device

    [ForeignKey("UserId")]
    public User? User { get; set; }

    public int? DeviceId { get; set; } // The device being repaired

    [ForeignKey("DeviceId")]
    public Device? Device { get; set; }

    [Required]
    [MaxLength(1000)]
    public required string IssueDescription { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Received"; // Default status

    public int? AssignedToUserId { get; set; } // Technician assigned to the repair

    [ForeignKey("AssignedToUserId")]
    public User? AssignedTo { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? EstimatedCost { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
