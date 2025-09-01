using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Part
{
    public int PartId { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [MaxLength(100)]
    public string? PartNumber { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
}
