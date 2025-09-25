using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Technician")]
    public class TechnicianController : ControllerBase
    {
        private readonly TechnicianService _technicianService;

        public TechnicianController(TechnicianService technicianService)
        {
            _technicianService = technicianService;
        }

        // GET: api/technician/assigned-repairs
        [HttpGet("assigned-repairs")]
        public async Task<IActionResult> GetAssignedRepairs()
        {
            try
            {
                var technicianIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(technicianIdClaim, out int technicianId))
                {
                    return Unauthorized("Invalid technician ID");
                }

                var repairs = await _technicianService.GetAssignedRepairsAsync(technicianId);
                return Ok(repairs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/technician/repair/{id}/status
        [HttpPut("repair/{id}/status")]
        public async Task<IActionResult> UpdateRepairStatus(int id, [FromBody] UpdateRepairStatusRequest request)
        {
            try
            {
                var technicianIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(technicianIdClaim, out int technicianId))
                {
                    return Unauthorized("Invalid technician ID");
                }

                var result = await _technicianService.UpdateRepairStatusAsync(id, technicianId, request.Status, request.EstimatedCompletionDays);
                
                if (!result)
                {
                    return NotFound("Repair request not found or not assigned to you");
                }

                return Ok(new { message = "Repair status updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/technician/repair/{id}
        [HttpGet("repair/{id}")]
        public async Task<IActionResult> GetRepairDetails(int id)
        {
            try
            {
                var technicianIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(technicianIdClaim, out int technicianId))
                {
                    return Unauthorized("Invalid technician ID");
                }

                var repair = await _technicianService.GetRepairDetailsAsync(id, technicianId);
                
                if (repair == null)
                {
                    return NotFound("Repair request not found or not assigned to you");
                }

                return Ok(repair);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // DTO for updating repair status
    public class UpdateRepairStatusRequest
    {
        public RepairStatus Status { get; set; }
        public int? EstimatedCompletionDays { get; set; }
    }
}