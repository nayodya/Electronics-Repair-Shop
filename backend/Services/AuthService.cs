using backend.Data;
using backend.Dto;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task RegisterAsync(RegisterUserDto dto)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (existingUser) throw new Exception("An account with this email already exists.");

        var verificationToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Customer",
            VerificationToken = verificationToken,
            VerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var verificationLink = $"{_configuration["ClientAppUrl"]}/verify-email?token={verificationToken}";
        var emailBody = $"<h1>Welcome to ERS!</h1><p>Please verify your email by <a href='{verificationLink}'>clicking here</a>. This link is valid for 24 hours.</p>";

        await _emailService.SendEmailAsync(user.Email, "Verify Your ERS Account", emailBody);
    }

    public async Task VerifyEmailAsync(string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);

        if (user == null || user.VerificationTokenExpiresAt < DateTime.UtcNow)
            throw new Exception("Invalid or expired verification token.");

        if (user.EmailVerifiedAt.HasValue)
            throw new Exception("Email is already verified.");

        user.EmailVerifiedAt = DateTime.UtcNow;
        user.VerificationToken = null;
        user.VerificationTokenExpiresAt = null;

        await _context.SaveChangesAsync();
    }

    public async Task<string> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new Exception("Invalid email or password.");

        if (user.EmailVerifiedAt == null)
            throw new Exception("Please verify your email before logging in.");

        return GenerateJwtToken(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null) return;

        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));
        user.PasswordResetToken = resetToken;
        user.ResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        var resetLink = $"{_configuration["ClientAppUrl"]}/reset-password?token={resetToken}";
        var emailBody = $"<h1>Password Reset Request</h1><p>Click <a href='{resetLink}'>here</a> to reset your password.</p>";

        await _emailService.SendEmailAsync(user.Email, "ERS Password Reset", emailBody);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == dto.Token && u.ResetTokenExpiresAt > DateTime.UtcNow);

        if (user == null)
            throw new Exception("Invalid or expired password reset token.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.ResetTokenExpiresAt = null;

        await _context.SaveChangesAsync();
    }

    public async Task CreateProfileAsync(CreateAccountDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
        {
            throw new Exception("User not found.");
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Address = dto.Address;
        user.ContactNumber = dto.ContactNumber;

        await _context.SaveChangesAsync();
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtConfig:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtConfig:Issuer"],
            audience: _configuration["JwtConfig:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtConfig:TokenValidityMins"])),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AccountDetailsDto> GetProfileAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found.");

        return new AccountDetailsDto
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address = user.Address,
            ContactNumber = user.ContactNumber
        };
    }

    public async Task UpdateProfileAsync(int userId, UpdateAccountDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Address = dto.Address;
        user.ContactNumber = dto.ContactNumber;

        await _context.SaveChangesAsync();
    }


}