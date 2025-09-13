using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class UpdateRepairStatusDto
    {
        [Required]
        public RepairStatus Status { get; set; }
    }
}
