using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Device
{
    public int DeviceId { get; set; }

    [Required]
    public int UserId { get; set; } // Foreign key to User

    [ForeignKey("UserId")]
    public User? User { get; set; } // Navigation property

    [MaxLength(100)]
    public string? Make { get; set; } // e.g., "Apple"

    [MaxLength(100)]
    public string? Model { get; set; } // e.g., "iPhone 14 Pro"

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; } // Any other relevant notes
}

