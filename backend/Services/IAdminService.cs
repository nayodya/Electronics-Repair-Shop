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

        #region Payment Management
        Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync(PaymentFilterDto? filter = null);
        Task<PaymentResponseDto> GetPaymentByIdAsync(int paymentId);
        Task<PaymentResponseDto> GetPaymentByRepairIdAsync(int repairId);
        Task<Payment> CreatePaymentAsync(int repairId, CreatePaymentDto dto);
        Task UpdatePaymentAsync(int paymentId, UpdatePaymentDto dto);
        Task MarkPaymentAsPaidAsync(int paymentId, MarkPaymentPaidDto dto);
        Task DeletePaymentAsync(int paymentId);
        Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<IEnumerable<PaymentResponseDto>> GetPendingPaymentsAsync();
        Task<IEnumerable<PaymentResponseDto>> GetCompletedPaymentsAsync();
        #endregion
    }
}
