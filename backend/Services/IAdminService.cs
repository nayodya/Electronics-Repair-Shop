using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAdminService
    {
        // User Management
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int userId);
        Task<User> CreateUserAsync(UserManagementDto dto);
        Task UpdateUserAsync(int userId, UserManagementDto dto);
        Task DeleteUserAsync(int userId);
        Task AssignRoleAsync(int userId, string role);
        Task<IEnumerable<User>> GetAllTechniciansAsync();

        // Repair Management
        Task<IEnumerable<RepairRequest>> GetAllRepairsAsync();
        Task<RepairRequest> GetRepairByIdAsync(int repairId);
        Task<RepairRequest> CreateRepairAsync(AdminRepairDto dto);
        Task UpdateRepairAsync(int repairId, AdminRepairDto dto);
        Task DeleteRepairAsync(int repairId);
        Task AssignTechnicianAsync(int repairId, int technicianId);
        Task UpdateRepairStatusAsync(int repairId, UpdateRepairStatusDto dto);
        Task UpdatePaymentAsync(int repairId, PaymentDto dto);
        Task MarkReadyForDeliveryAsync(int repairId);

        // Dashboard
        Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    }
}
