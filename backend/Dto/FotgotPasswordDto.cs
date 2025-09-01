using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}
