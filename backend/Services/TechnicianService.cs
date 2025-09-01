using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TechnicianService : ITechnicianService
{
    private readonly ApplicationDbContext _context;

    public TechnicianService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RepairRequest>> GetMyAssignedRepairsAsync(int technicianId)
    {
        return await _context.RepairRequests
            .Where(r => r.AssignedToUserId == technicianId) // Only assigned repairs
            .Include(r => r.User)   // Include customer details
            .Include(r => r.Device) // Include device details
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task AcceptRepairRequestAsync(int repairRequestId, int technicianId)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null)
            throw new Exception("Repair request not found.");

        if (repairRequest.AssignedToUserId != technicianId)
            throw new UnauthorizedAccessException("You are not assigned to this repair request.");

        repairRequest.Status = "In Repair";
        repairRequest.UpdatedAt = DateTime.UtcNow;

        var statusHistory = new StatusHistory
        {
            RepairRequestId = repairRequestId,
            Status = "In Repair",
            Note = "Technician has accepted the job and started the repair process.",
            ChangedById = technicianId
        };
        _context.StatusHistories.Add(statusHistory);

        await _context.SaveChangesAsync();
    }

    public async Task AddPartToRepairAsync(int repairRequestId, int technicianId, AddPartToRepairDto partDto)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null)
            throw new Exception("Repair request not found.");

        if (repairRequest.AssignedToUserId != technicianId)
            throw new UnauthorizedAccessException("You are not assigned to this repair request.");

        var part = await _context.Parts.FindAsync(partDto.PartId);
        if (part == null)
            throw new Exception("Part not found in inventory.");

        var repairPart = new RepairPart
        {
            RepairRequestId = repairRequestId,
            PartId = partDto.PartId,
            Quantity = partDto.Quantity,
            Cost = part.Price * partDto.Quantity
        };
        _context.RepairParts.Add(repairPart);

        await _context.SaveChangesAsync();
    }
}
