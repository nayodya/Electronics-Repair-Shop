using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Technician")] // All endpoints are for Technicians only
public class TechnicianController : ControllerBase
{
    private readonly ITechnicianService _technicianService;

    public TechnicianController(ITechnicianService technicianService)
    {
        _technicianService = technicianService;
    }

    [HttpGet("my-repairs")]
    public async Task<IActionResult> GetMyAssignedRepairs()
    {
        var technicianId = GetCurrentUserId();
        if (technicianId == null) return Unauthorized();

        var repairs = await _technicianService.GetMyAssignedRepairsAsync(technicianId.Value);
        return Ok(repairs);
    }

    [HttpPost("repairs/{id}/accept")]
    public async Task<IActionResult> AcceptRepairRequest(int id)
    {
        var technicianId = GetCurrentUserId();
        if (technicianId == null) return Unauthorized();

        await _technicianService.AcceptRepairRequestAsync(id, technicianId.Value);
        return Ok(new { message = "Repair request accepted. Status updated to 'In Repair'." });
    }

    [HttpPost("repairs/{id}/parts")]
    public async Task<IActionResult> AddPartToRepair(int id, [FromBody] AddPartToRepairDto partDto)
    {
        var technicianId = GetCurrentUserId();
        if (technicianId == null) return Unauthorized();

        await _technicianService.AddPartToRepairAsync(id, technicianId.Value, partDto);
        return Ok(new { message = "Part added successfully." });
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
