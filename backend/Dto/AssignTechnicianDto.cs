using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class AssignTechnicianDto
{
    [Required]
    public int TechnicianUserId { get; set; }
}