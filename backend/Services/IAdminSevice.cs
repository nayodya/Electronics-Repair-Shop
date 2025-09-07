using backend.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services;

public interface IAdminService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<List<UserDto>> GetTechniciansAsync();
    Task AssignTechnicianAsync(int repairRequestId, int technicianUserId, int adminId);

}