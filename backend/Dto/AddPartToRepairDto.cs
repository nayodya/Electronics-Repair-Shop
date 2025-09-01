using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class AddPartToRepairDto
{
    [Required]
    public int PartId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}
