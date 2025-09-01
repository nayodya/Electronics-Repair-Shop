using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();
    }

    public async Task<List<UserDto>> GetTechniciansAsync()
    {
        return await _context.Users
            .Where(u => u.Role == "Technician")
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();
    }

    public async Task AssignTechnicianAsync(int repairRequestId, int technicianUserId, int adminId)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null)
            throw new Exception("Repair request not found.");

        var technician = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == technicianUserId && u.Role == "Technician");

        if (technician == null)
            throw new Exception("Invalid Technician ID or user is not a technician.");

        repairRequest.AssignedToUserId = technicianUserId;
        repairRequest.UpdatedAt = DateTime.UtcNow;

        var statusHistory = new StatusHistory
        {
            RepairRequestId = repairRequestId,
            Status = repairRequest.Status,
            Note = $"Assigned to technician: {technician.FullName ?? technician.Email}",
            ChangedById = adminId
        };
        _context.StatusHistories.Add(statusHistory);

        await _context.SaveChangesAsync();
    }
}
