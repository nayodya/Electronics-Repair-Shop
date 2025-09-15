using backend.Data;
using backend.Dto;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(ApplicationDbContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            _logger.LogInformation("Fetching all users for admin.");
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            _logger.LogInformation($"Fetching user with ID: {userId}.");
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            return user;
        }

        public async Task<User> CreateUserAsync(UserManagementDto dto)
        {
            _logger.LogInformation($"Creating a new user with email: {dto.Email}.");
            var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (existingUser)
            {
                throw new Exception("An account with this email already exists.");
            }

            var user = new User
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Address = dto.Address,
                ContactNumber = dto.ContactNumber,
                PasswordHash = "placeholder", // Passwords will be reset later
                Role = dto.Role,
                EmailVerifiedAt = DateTime.UtcNow // Admins can create verified accounts
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUserAsync(int userId, UserManagementDto dto)
        {
            _logger.LogInformation($"Updating user with ID: {userId}.");
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Address = dto.Address;
            user.ContactNumber = dto.ContactNumber;
            user.Role = dto.Role;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int userId)
        {
            _logger.LogInformation($"Deleting user with ID: {userId}.");
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task AssignRoleAsync(int userId, string role)
        {
            _logger.LogInformation($"Assigning role '{role}' to user with ID: {userId}.");
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            user.Role = role;
            await _context.SaveChangesAsync();
        }

    }
}
