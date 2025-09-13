using backend.Dto;
using backend.Models;

namespace backend.Services;

public interface IRepairService
{
    Task<RepairRequest> CreateRepairRequestAsync(int customerId, CreateRepairRequestDto dto);
    Task<IEnumerable<RepairRequest>> GetCustomerRepairRequestsAsync(int customerId);
    Task<RepairRequest> GetRepairRequestByReferenceNumberAsync(string referenceNumber);
    Task<IEnumerable<RepairRequest>> GetAllRepairRequestsAsync();
    Task UpdateRepairStatusAsync(int requestId, RepairStatus status);
    Task AddPaymentAsync(int requestId, AddPaymentDto dto);
    Task AssignTechnicianAsync(int requestId, int technicianId);
    Task UpdateEstimatedCompletionDaysAsync(int requestId, int days);
    Task<IEnumerable<User>> GetTechniciansAsync();
}