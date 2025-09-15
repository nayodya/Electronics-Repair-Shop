using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class AssignRoleDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public required string Role { get; set; }
    }
}
