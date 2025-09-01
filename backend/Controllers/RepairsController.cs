using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protect all endpoints in this controller
public class RepairsController : ControllerBase
{
    private readonly IRepairsService _repairsService;

    public RepairsController(IRepairsService repairsService)
    {
        _repairsService = repairsService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRepairRequest([FromBody] CreateRepairRequestDto requestDto)
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            var result = await _repairsService.CreateRepairRequestAsync(userId, requestDto);
            return StatusCode(201, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/status")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto statusDto)
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int.TryParse(userIdString, out var staffId);

            await _repairsService.UpdateStatusAsync(id, statusDto, staffId);
            return Ok(new { message = $"Repair status updated to '{statusDto.NewStatus}'." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/parts")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<IActionResult> AddPartToRepair(int id, [FromBody] AddPartToRepairDto partDto)
    {
        try
        {
            await _repairsService.AddPartToRepairAsync(id, partDto);
            return Ok(new { message = "Part added successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/payments")]
    [Authorize(Roles = "Admin")] // Only Admins can record payments
    public async Task<IActionResult> RecordPayment(int id, [FromBody] RecordPaymentDto paymentDto)
    {
        try
        {
            await _repairsService.RecordPaymentAsync(id, paymentDto);
            return Ok(new { message = "Payment recorded successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
