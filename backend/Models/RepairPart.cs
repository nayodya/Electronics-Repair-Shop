using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class RepairPart
{
    public int RepairPartId { get; set; }

    [Required]
    public int RepairRequestId { get; set; }

    [ForeignKey("RepairRequestId")]
    public RepairRequest? RepairRequest { get; set; }

    [Required]
    public int PartId { get; set; }

    [ForeignKey("PartId")]
    public Part? Part { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Cost { get; set; } // Cost at the time of repair (Quantity * Part.Price)
}