using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dto;

public class CreateRepairRequestDto
{
    [Required]
    public string Device { get; set; }

    [Required]
    public string Brand { get; set; }

    [Required]
    public string Model { get; set; }

    [Required]
    public string Issue { get; set; }

    public string? Description { get; set; }
}
