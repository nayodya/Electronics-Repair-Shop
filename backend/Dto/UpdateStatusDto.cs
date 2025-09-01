using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class UpdateStatusDto
{
    [Required]
    [MaxLength(50)]
    public required string NewStatus { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}