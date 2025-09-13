using System.ComponentModel.DataAnnotations;

namespace backend.Dto;

public class CreateAccountDto
{
    // The UserId will be passed from the authenticated user
    public int UserId { get; set; }

    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string LastName { get; set; }

    [Required]
    public required string Address { get; set; }

    [Required]
    [RegularExpression(@"^\+?\d{10,15}$", ErrorMessage = "Invalid contact number format.")]
    public required string ContactNumber { get; set; }
}
