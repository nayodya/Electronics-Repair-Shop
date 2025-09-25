using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TechnicianService
    {
        private readonly ApplicationDbContext _context;

        public TechnicianService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all repairs assigned to a specific technician
        public async Task<List<RepairRequest>> GetAssignedRepairsAsync(int technicianId)
        {
            return await _context.RepairRequests
                .Include(r => r.Customer)
                .Include(r => r.PaymentDetails)
                .Where(r => r.TechnicianId == technicianId)
                .OrderBy(r => r.SubmittedAt)
                .ToListAsync();
        }

        // Get specific repair details for a technician
        public async Task<RepairRequest?> GetRepairDetailsAsync(int repairId, int technicianId)
        {
            return await _context.RepairRequests
                .Include(r => r.Customer)
                .Include(r => r.PaymentDetails)
                .FirstOrDefaultAsync(r => r.RequestId == repairId && r.TechnicianId == technicianId);
        }

        // Update repair status (only technician assigned to the repair can update)
        public async Task<bool> UpdateRepairStatusAsync(int repairId, int technicianId, RepairStatus newStatus, int? estimatedCompletionDays = null)
        {
            var repair = await _context.RepairRequests
                .FirstOrDefaultAsync(r => r.RequestId == repairId && r.TechnicianId == technicianId);

            if (repair == null)
            {
                return false;
            }

            // Validate status transitions
            if (!IsValidStatusTransition(repair.Status, newStatus))
            {
                throw new ArgumentException($"Invalid status transition from {repair.Status} to {newStatus}");
            }

            repair.Status = newStatus;
            
            if (estimatedCompletionDays.HasValue)
            {
                repair.EstimatedCompletionDays = estimatedCompletionDays;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Get repairs by status for a technician
        public async Task<List<RepairRequest>> GetRepairsByStatusAsync(int technicianId, RepairStatus status)
        {
            return await _context.RepairRequests
                .Include(r => r.Customer)
                .Include(r => r.PaymentDetails)
                .Where(r => r.TechnicianId == technicianId && r.Status == status)
                .OrderBy(r => r.SubmittedAt)
                .ToListAsync();
        }

        // Get repair statistics for a technician
        public async Task<TechnicianStatistics> GetTechnicianStatisticsAsync(int technicianId)
        {
            var repairs = await _context.RepairRequests
                .Where(r => r.TechnicianId == technicianId)
                .ToListAsync();

            return new TechnicianStatistics
            {
                TotalAssigned = repairs.Count,
                InProgress = repairs.Count(r => r.Status == RepairStatus.InProgress),
                Completed = repairs.Count(r => r.Status == RepairStatus.Completed),
                ReadyForDelivery = repairs.Count(r => r.Status == RepairStatus.ReadyForDelivery),
                Delivered = repairs.Count(r => r.Status == RepairStatus.Delivered),
                Cancelled = repairs.Count(r => r.Status == RepairStatus.Cancelled)
            };
        }

        // Validate if a status transition is allowed
        private bool IsValidStatusTransition(RepairStatus currentStatus, RepairStatus newStatus)
        {
            return currentStatus switch
            {
                RepairStatus.Received => newStatus == RepairStatus.InProgress || newStatus == RepairStatus.Cancelled,
                RepairStatus.InProgress => newStatus == RepairStatus.Completed || newStatus == RepairStatus.Cancelled,
                RepairStatus.Completed => newStatus == RepairStatus.ReadyForDelivery,
                RepairStatus.ReadyForDelivery => newStatus == RepairStatus.Delivered,
                RepairStatus.Cancelled => false, // Cannot change from cancelled
                RepairStatus.Delivered => false, // Cannot change from delivered
                _ => false
            };
        }
    }

    // DTO for technician statistics
    public class TechnicianStatistics
    {
        public int TotalAssigned { get; set; }
        public int InProgress { get; set; }
        public int Completed { get; set; }
        public int ReadyForDelivery { get; set; }
        public int Delivered { get; set; }
        public int Cancelled { get; set; }
    }
}