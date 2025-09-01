using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class CreateRepairRequestDto
{
    // Device Information
    [Required]
    [MaxLength(100)]
    public required string Make { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Model { get; set; }

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    // Repair Information
    [Required]
    [MaxLength(1000)]
    public required string IssueDescription { get; set; }
}