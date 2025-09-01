namespace backend.Dtos;

public class UserDto
{
    public int UserId { get; set; }
    public required string Email { get; set; }
    public string? FullName { get; set; }
    public required string Role { get; set; }
}
