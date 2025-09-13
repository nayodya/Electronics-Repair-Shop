using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dto;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RepairController : ControllerBase
{
    private readonly IRepairService _repairService;
    private readonly ILogger<RepairController> _logger;

    public RepairController(IRepairService repairService, ILogger<RepairController> logger)
    {
        _repairService = repairService;
        _logger = logger;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitRepairRequest([FromBody] CreateRepairRequestDto dto)
    {
        try
        {
            var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerIdClaim == null || !int.TryParse(customerIdClaim.Value, out var customerId))
            {
                _logger.LogWarning("Unauthorized access attempt. User ID claim is missing or invalid.");
                return Unauthorized(new { message = "Invalid user identity." });
            }

            _logger.LogInformation($"Customer with ID {customerId} is submitting a new repair request.");
            var newRequest = await _repairService.CreateRepairRequestAsync(customerId, dto);
            return StatusCode(201, new { message = "Repair request submitted successfully.", referenceNumber = newRequest.ReferenceNumber });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while submitting a repair request.");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my-requests")]
    public async Task<IActionResult> GetCustomerRequests()
    {
        try
        {
            var customerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (customerIdClaim == null || !int.TryParse(customerIdClaim.Value, out var customerId))
            {
                _logger.LogWarning("Unauthorized access attempt. User ID claim is missing or invalid.");
                return Unauthorized(new { message = "Invalid user identity." });
            }
            _logger.LogInformation($"Fetching repair requests for customer with ID {customerId}.");
            var requests = await _repairService.GetCustomerRepairRequestsAsync(customerId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching customer repair requests.");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllRepairRequests()
    {
        try
        {
            _logger.LogInformation("Admin is requesting all repair requests.");
            var requests = await _repairService.GetAllRepairRequestsAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching all repair requests.");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpGet("{referenceNumber}")]
    public async Task<IActionResult> GetRequestByReferenceNumber(string referenceNumber)
    {
        try
        {
            _logger.LogInformation($"Fetching request with reference number: {referenceNumber}.");
            var request = await _repairService.GetRepairRequestByReferenceNumberAsync(referenceNumber);
            return Ok(request);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Repair request not found: {referenceNumber}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while getting request by reference number: {referenceNumber}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpPut("{requestId}/status")]
    public async Task<IActionResult> UpdateStatus(int requestId, [FromBody] UpdateRepairStatusDto dto)
    {
        try
        {
            _logger.LogInformation($"Updating status for request ID {requestId} to {dto.Status}.");
            await _repairService.UpdateRepairStatusAsync(requestId, dto.Status);
            return Ok(new { message = "Repair status updated successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Repair request not found: {requestId}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while updating status for request: {requestId}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{requestId}/assign")]
    public async Task<IActionResult> AssignTechnician(int requestId, [FromBody] AssignTechnicianDto dto)
    {
        try
        {
            _logger.LogInformation($"Assigning technician {dto.TechnicianId} to request ID {requestId}.");
            await _repairService.AssignTechnicianAsync(requestId, dto.TechnicianId);
            return Ok(new { message = "Technician assigned successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Repair request not found: {requestId}");
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning($"Invalid technician ID or role for request: {requestId}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while assigning technician for request: {requestId}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{requestId}/estimated-days")]
    public async Task<IActionResult> UpdateEstimatedDays(int requestId, [FromBody] UpdateEstimatedDaysDto dto)
    {
        try
        {
            _logger.LogInformation($"Updating estimated completion days for request ID {requestId} to {dto.EstimatedCompletionDays}.");
            await _repairService.UpdateEstimatedCompletionDaysAsync(requestId, dto.EstimatedCompletionDays);
            return Ok(new { message = "Estimated completion days updated successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Repair request not found: {requestId}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while updating estimated days for request: {requestId}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{requestId}/payment")]
    public async Task<IActionResult> AddPayment(int requestId, [FromBody] AddPaymentDto dto)
    {
        try
        {
            _logger.LogInformation($"Adding payment for request ID {requestId}. Total: {dto.TotalAmount}.");
            await _repairService.AddPaymentAsync(requestId, dto);
            return Ok(new { message = "Payment details added successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Repair request not found: {requestId}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while adding payment for request: {requestId}");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Technician")]
    [HttpGet("technicians")]
    public async Task<IActionResult> GetTechnicians()
    {
        try
        {
            _logger.LogInformation("Fetching list of technicians.");
            var technicians = await _repairService.GetTechniciansAsync();
            return Ok(technicians);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching technicians.");
            return BadRequest(new { message = ex.Message });
        }
    }
}
