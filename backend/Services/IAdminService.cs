using backend.Dto;
using backend.Models;

namespace backend.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int userId);
        Task<User> CreateUserAsync(UserManagementDto dto);
        Task UpdateUserAsync(int userId, UserManagementDto dto);
        Task DeleteUserAsync(int userId);
        Task AssignRoleAsync(int userId, string role);
    }
}
