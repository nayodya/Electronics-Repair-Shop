using backend.Data;
using backend.Dto;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services;

public class RepairService : IRepairService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RepairService> _logger;

    public RepairService(ApplicationDbContext context, ILogger<RepairService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RepairRequest> CreateRepairRequestAsync(int customerId, CreateRepairRequestDto dto)
    {
        var request = new RepairRequest
        {
            CustomerId = customerId,
            Device = dto.Device,
            Brand = dto.Brand,
            Model = dto.Model,
            Issue = dto.Issue,
            Description = dto.Description,
            Status = RepairStatus.Received,
            SubmittedAt = DateTime.UtcNow
        };

        await _context.RepairRequests.AddAsync(request);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"New repair request created with ReferenceNumber: {request.ReferenceNumber}");

        return request;
    }

    public async Task<IEnumerable<RepairRequest>> GetCustomerRepairRequestsAsync(int customerId)
    {
        return await _context.RepairRequests
            .Include(r => r.Customer)
            .Include(r => r.Technician)
            .Include(r => r.PaymentDetails)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();
    }

    public async Task<RepairRequest> GetRepairRequestByReferenceNumberAsync(string referenceNumber)
    {
        var request = await _context.RepairRequests
            .Include(r => r.Customer)
            .Include(r => r.Technician)
            .Include(r => r.PaymentDetails)
            .FirstOrDefaultAsync(r => r.ReferenceNumber == referenceNumber);

        if (request == null)
        {
            throw new KeyNotFoundException($"Repair request with reference number {referenceNumber} not found.");
        }
        return request;
    }

    public async Task<IEnumerable<RepairRequest>> GetAllRepairRequestsAsync()
    {
        return await _context.RepairRequests
            .Include(r => r.Customer)
            .Include(r => r.Technician)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();
    }

    public async Task UpdateRepairStatusAsync(int requestId, RepairStatus status)
    {
        var request = await _context.RepairRequests.FindAsync(requestId);
        if (request == null)
        {
            throw new KeyNotFoundException($"Repair request with ID {requestId} not found.");
        }
        request.Status = status;
        await _context.SaveChangesAsync();
    }

    public async Task UpdateEstimatedCompletionDaysAsync(int requestId, int days)
    {
        var request = await _context.RepairRequests.FindAsync(requestId);
        if (request == null)
        {
            throw new KeyNotFoundException($"Repair request with ID {requestId} not found.");
        }
        request.EstimatedCompletionDays = days;
        await _context.SaveChangesAsync();
    }

    public async Task AddPaymentAsync(int requestId, AddPaymentDto dto)
    {
        var request = await _context.RepairRequests.FindAsync(requestId);
        if (request == null)
        {
            throw new KeyNotFoundException($"Repair request with ID {requestId} not found.");
        }

        var payment = new Payment
        {
            RequestId = requestId,
            TotalAmount = dto.TotalAmount,
            AdvancedPayment = dto.AdvancedPayment,
            PaymentDate = DateTime.UtcNow
        };

        await _context.Payments.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task AssignTechnicianAsync(int requestId, int technicianId)
    {
        var request = await _context.RepairRequests.FindAsync(requestId);
        if (request == null)
        {
            throw new KeyNotFoundException($"Repair request with ID {requestId} not found.");
        }
        var technician = await _context.Users.FirstOrDefaultAsync(u => u.UserId == technicianId && u.Role == "Technician");
        if (technician == null)
        {
            throw new ArgumentException("Technician not found or is not a technician role.");
        }

        request.TechnicianId = technicianId;
        request.Status = RepairStatus.InProgress;
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<User>> GetTechniciansAsync()
    {
        return await _context.Users
            .Where(u => u.Role == "Technician")
            .ToListAsync();
    }
}
