using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class AssignTechnicianDto
    {
        [Required]
        public int TechnicianId { get; set; }
    }
}
