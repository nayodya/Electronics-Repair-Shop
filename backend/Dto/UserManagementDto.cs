using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class UserManagementDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Address { get; set; }
        public string? ContactNumber { get; set; }
        public required string Role { get; set; }
    }
}
