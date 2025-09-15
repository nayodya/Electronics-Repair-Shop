using backend.Dto;

namespace backend.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterUserDto dto);
    Task VerifyEmailAsync(string token);
    Task<string> LoginAsync(LoginDto dto);
    Task ForgotPasswordAsync(ForgotPasswordDto dto);
    Task ResetPasswordAsync(ResetPasswordDto dto);
    Task CreateProfileAsync(CreateAccountDto dto);
    Task<AccountDetailsDto> GetProfileAsync(int userId);
    Task UpdateProfileAsync(int userId, UpdateAccountDto dto);


}
