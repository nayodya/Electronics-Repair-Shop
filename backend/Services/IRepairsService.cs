using backend.Dtos;

namespace backend.Services;

public interface IRepairsService
{
    Task<object> CreateRepairRequestAsync(int userId, CreateRepairRequestDto dto);
    Task UpdateStatusAsync(int repairRequestId, UpdateStatusDto dto, int staffId);
    Task AddPartToRepairAsync(int repairRequestId, AddPartToRepairDto dto);
    Task RecordPaymentAsync(int repairRequestId, RecordPaymentDto dto);
}
