using backend.Dtos;
using backend.Models;

namespace backend.Services;

public interface ITechnicianService
{
    Task<List<RepairRequest>> GetMyAssignedRepairsAsync(int technicianId);
    Task AcceptRepairRequestAsync(int repairRequestId, int technicianId);
    Task AddPartToRepairAsync(int repairRequestId, int technicianId, AddPartToRepairDto partDto);
}
