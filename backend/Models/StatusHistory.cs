using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class StatusHistory
{
    public int StatusHistoryId { get; set; }

    [Required]
    public int RepairRequestId { get; set; }

    [ForeignKey("RepairRequestId")]
    public RepairRequest? RepairRequest { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Status { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    [Required]
    public int ChangedById { get; set; }

    [ForeignKey("ChangedById")]
    public User? ChangedBy { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}