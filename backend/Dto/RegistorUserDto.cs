using System.ComponentModel.DataAnnotations;

public class RegisterUserDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(8)]
    public required string Password { get; set; }

    [Required]
    [MaxLength(100)]
    public required string FullName { get; set; }
}