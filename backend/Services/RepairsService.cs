using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class RepairsService : IRepairsService
{
    private readonly ApplicationDbContext _context;

    public RepairsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> CreateRepairRequestAsync(int userId, CreateRepairRequestDto dto)
    {
        var device = new Device
        {
            UserId = userId,
            Make = dto.Make,
            Model = dto.Model,
            SerialNumber = dto.SerialNumber
        };
        _context.Devices.Add(device);
        await _context.SaveChangesAsync();

        var repairRequest = new RepairRequest
        {
            ReferenceNumber = GenerateReferenceNumber(),
            UserId = userId,
            DeviceId = device.DeviceId,
            IssueDescription = dto.IssueDescription,
            Status = "Received"
        };
        _context.RepairRequests.Add(repairRequest);
        await _context.SaveChangesAsync();

        return new
        {
            message = "Repair request created successfully.",
            repairRequestId = repairRequest.RepairRequestId,
            referenceNumber = repairRequest.ReferenceNumber
        };
    }

    public async Task UpdateStatusAsync(int repairRequestId, UpdateStatusDto dto, int staffId)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null) throw new Exception("Repair request not found.");

        repairRequest.Status = dto.NewStatus;
        repairRequest.UpdatedAt = DateTime.UtcNow;

        var statusHistory = new StatusHistory
        {
            RepairRequestId = repairRequestId,
            Status = dto.NewStatus,
            Note = dto.Note,
            ChangedById = staffId
        };
        _context.StatusHistories.Add(statusHistory);

        await _context.SaveChangesAsync();
    }

    public async Task AddPartToRepairAsync(int repairRequestId, AddPartToRepairDto dto)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null) throw new Exception("Repair request not found.");

        var part = await _context.Parts.FindAsync(dto.PartId);
        if (part == null) throw new Exception("Part not found.");

        var repairPart = new RepairPart
        {
            RepairRequestId = repairRequestId,
            PartId = dto.PartId,
            Quantity = dto.Quantity,
            Cost = part.Price * dto.Quantity
        };
        _context.RepairParts.Add(repairPart);
        await _context.SaveChangesAsync();
    }

    public async Task RecordPaymentAsync(int repairRequestId, RecordPaymentDto dto)
    {
        var repairRequest = await _context.RepairRequests.FindAsync(repairRequestId);
        if (repairRequest == null) throw new Exception("Repair request not found.");

        var payment = new Payment
        {
            RepairRequestId = repairRequestId,
            Amount = dto.Amount,
            Method = dto.Method,
            TransactionId = dto.TransactionId
        };
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
    }

    private string GenerateReferenceNumber()
    {
        var datePart = DateTime.UtcNow.ToString("yyMMdd");
        var randomPart = Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
        return $"ERS-{datePart}-{randomPart}";
    }
}
