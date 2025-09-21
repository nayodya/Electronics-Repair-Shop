using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Dto;
using Microsoft.Extensions.Logging;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;
        private readonly ApplicationDbContext _context; // Add your DbContext here

        public AdminController(IAdminService adminService, ILogger<AdminController> logger, ApplicationDbContext context)
        {
            _adminService = adminService;
            _logger = logger;
            _context = context;
        }

        #region User Management
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all users.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            try
            {
                var user = await _adminService.GetUserByIdAsync(userId);
                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching a user by ID.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] UserManagementDto dto)
        {
            try
            {
                var newUser = await _adminService.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUserById), new { userId = newUser.UserId }, newUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a user.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserManagementDto dto)
        {
            try
            {
                await _adminService.UpdateUserAsync(userId, dto);
                return Ok(new { message = "User updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating a user.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                await _adminService.DeleteUserAsync(userId);
                return Ok(new { message = "User deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting a user.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("users/{userId}/assign-role")]
        public async Task<IActionResult> AssignRole(int userId, [FromBody] AssignRoleDto dto)
        {
            try
            {
                await _adminService.AssignRoleAsync(userId, dto.Role);
                return Ok(new { message = $"Role '{dto.Role}' assigned successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while assigning a role.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("technicians")]
        public async Task<IActionResult> GetAllTechnicians()
        {
            try
            {
                var technicians = await _adminService.GetAllTechniciansAsync();
                return Ok(technicians);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching technicians.");
                return BadRequest(new { message = ex.Message });
            }
        }
        #endregion

        #region Repair Management
        [HttpGet("repairs")]
        public async Task<IActionResult> GetAllRepairs()
        {
            try
            {
                var repairs = await _adminService.GetAllRepairsAsync();
                return Ok(repairs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all repairs.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("repairs/{repairId}")]
        public async Task<IActionResult> GetRepairById(int repairId)
        {
            try
            {
                var repair = await _adminService.GetRepairByIdAsync(repairId);
                return Ok(repair);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching repair by ID.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("repairs")]
        public async Task<IActionResult> CreateRepair([FromBody] AdminRepairDto dto)
        {
            try
            {
                var newRepair = await _adminService.CreateRepairAsync(dto);
                return CreatedAtAction(nameof(GetRepairById), new { repairId = newRepair.RequestId }, newRepair);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a repair.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repairs/{repairId}")]
        public async Task<IActionResult> UpdateRepair(int repairId, [FromBody] AdminRepairDto dto)
        {
            try
            {
                await _adminService.UpdateRepairAsync(repairId, dto);
                return Ok(new { message = "Repair updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating repair.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("repairs/{repairId}")]
        public async Task<IActionResult> DeleteRepair(int repairId)
        {
            try
            {
                await _adminService.DeleteRepairAsync(repairId);
                return Ok(new { message = "Repair deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting repair.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repairs/{repairId}/assign-technician")]
        public async Task<IActionResult> AssignTechnician(int repairId, [FromBody] AssignTechnicianDto dto)
        {
            try
            {
                await _adminService.AssignTechnicianAsync(repairId, dto.TechnicianId);
                return Ok(new { message = "Technician assigned successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while assigning technician.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repairs/{repairId}/update-status")]
        public async Task<IActionResult> UpdateRepairStatus(int repairId, [FromBody] UpdateRepairStatusDto dto)
        {
            try
            {
                await _adminService.UpdateRepairStatusAsync(repairId, dto);
                return Ok(new { message = "Repair status updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating repair status.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repairs/{repairId}/payment")]
        public async Task<IActionResult> UpdatePayment(int repairId, [FromBody] PaymentDto dto)
        {
            try
            {
                await _adminService.UpdatePaymentAsync(repairId, dto);
                return Ok(new { message = "Payment updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating payment.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repairs/{repairId}/ready-for-delivery")]
        public async Task<IActionResult> MarkReadyForDelivery(int repairId)
        {
            try
            {
                await _adminService.MarkReadyForDeliveryAsync(repairId);
                return Ok(new { message = "Repair marked as ready for delivery." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while marking repair ready for delivery.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("repairs/debug")]
        public async Task<IActionResult> GetAllRepairsDebug()
        {
            try
            {
                _logger.LogInformation("Debug: Fetching all repairs for admin.");
                var repairs = await _context.RepairRequests
                    .Include(r => r.Customer)
                    .Include(r => r.Technician)
                    .Include(r => r.PaymentDetails)
                    .Select(r => new {
                        RequestId = r.RequestId,
                        ReferenceNumber = r.ReferenceNumber,
                        CustomerId = r.CustomerId,
                        CustomerEmail = r.Customer.Email,
                        Device = r.Device,
                        Brand = r.Brand,
                        Model = r.Model,
                        Issue = r.Issue,
                        Status = r.Status,
                        StatusNumber = (int)r.Status,
                        SubmittedAt = r.SubmittedAt,
                        EstimatedCompletionDays = r.EstimatedCompletionDays,
                        TechnicianId = r.TechnicianId,
                        TechnicianEmail = r.Technician != null ? r.Technician.Email : null,
                        HasPayment = r.PaymentDetails != null,
                        PaymentAmount = r.PaymentDetails != null ? r.PaymentDetails.TotalAmount : 0
                    })
                    .ToListAsync();
                    
                return Ok(new { 
                    Count = repairs.Count,
                    Data = repairs 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Debug: An error occurred while fetching all repairs.");
                return BadRequest(new { 
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        #endregion

        #region Dashboard Statistics
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching dashboard stats.");
                return BadRequest(new { message = ex.Message });
            }
        }
        #endregion
    }
}
