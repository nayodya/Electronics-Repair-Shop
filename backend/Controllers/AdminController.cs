using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] // Admin-only endpoints
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("technicians")]
    public async Task<IActionResult> GetTechnicians()
    {
        var technicians = await _adminService.GetTechniciansAsync();
        return Ok(technicians);
    }

    [HttpPost("repairs/{id}/assign")]
    public async Task<IActionResult> AssignTechnician(int id, [FromBody] AssignTechnicianDto assignDto)
    {
        var adminId = GetCurrentUserId();
        if (adminId == null) return Unauthorized();

        await _adminService.AssignTechnicianAsync(id, assignDto.TechnicianUserId, adminId.Value);
        return Ok(new { message = "Technician assigned successfully." });
    }

    private int? GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
        {
            return userId;
        }
        return null;
    }
}
