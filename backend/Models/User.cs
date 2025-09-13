// File: User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    [Required]
    [EmailAddress]

    public required string Email { get; set; }

    [Required]

    public required string PasswordHash { get; set; }

    [Required]
    public required string Role { get; set; }

    // Verification properties
    public string? VerificationToken { get; set; }
    public DateTime? VerificationTokenExpiresAt { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }

    // Password reset properties
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpiresAt { get; set; }

    // Additional user information
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Address { get; set; }
    public string? ContactNumber { get; set; }
}
