using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(512)]
        public required string PasswordHash { get; set; }

        [MaxLength(100)]
        public string? FullName { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Role { get; set; } // "Customer", "Technician", "Admin"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Properties for Email Verification
        public DateTime? EmailVerifiedAt { get; set; }
        public string? VerificationToken { get; set; }
        public DateTime? VerificationTokenExpiresAt { get; set; }
    }
}