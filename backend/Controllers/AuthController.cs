using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using backend.Data;
using backend.Models;
using backend.Services;

namespace ErsApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ApplicationDbContext context, IEmailService emailService, ILogger<AuthController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userExists = await _context.Users.AnyAsync(u => u.Email == registerDto.Email);
        if (userExists)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var verificationToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));

        var user = new User
        {
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = registerDto.FullName,
            Role = "Customer",
            VerificationToken = verificationToken,
            VerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var verificationLink = Url.Action(nameof(VerifyEmail), "Auth", new { token = verificationToken }, Request.Scheme);

        if (verificationLink != null)
        {
            var emailBody = $"<h1>Welcome to ERS!</h1>" +
                            $"<p>Please verify your email by <a href='{verificationLink}'>clicking here</a>.</p>" +
                            $"<p>This link is valid for 24 hours.</p>";

            await _emailService.SendEmailAsync(user.Email, "Verify Your ERS Account", emailBody);
        }
        else
        {
            _logger.LogError("Could not generate email verification link.");
        }

        return StatusCode(201, new { message = "Registration successful. Please check your email to verify your account." });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { message = "Verification token is required." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.VerificationToken == token);

        if (user == null)
        {
            return NotFound(new { message = "Invalid verification token." });
        }

        if (user.EmailVerifiedAt.HasValue)
        {
            return BadRequest(new { message = "Email is already verified." });
        }

        if (user.VerificationTokenExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Verification token has expired." });
        }

        user.EmailVerifiedAt = DateTime.UtcNow;
        user.VerificationToken = null;
        user.VerificationTokenExpiresAt = null;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Email verified successfully. You can now log in." });
    }
}
