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

        #region User Management
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

        public async Task<IEnumerable<User>> GetAllTechniciansAsync()
        {
            _logger.LogInformation("Fetching all technicians.");
            return await _context.Users.Where(u => u.Role == "Technician").ToListAsync();
        }
        #endregion


        public async Task<RepairRequest> GetRepairByIdAsync(int repairId)
        {
            _logger.LogInformation($"Fetching repair with ID: {repairId}.");
            var repair = await _context.RepairRequests
                .Include(r => r.Customer)
                .Include(r => r.Technician)
                .Include(r => r.PaymentDetails)
                .FirstOrDefaultAsync(r => r.RequestId == repairId);

            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }
            return repair;
        }

        public async Task<RepairRequest> CreateRepairAsync(AdminRepairDto dto)
        {
            _logger.LogInformation($"Creating a new repair for customer ID: {dto.CustomerId}.");

            // Verify customer exists
            var customer = await _context.Users.FindAsync(dto.CustomerId);
            if (customer == null || customer.Role != "Customer")
            {
                throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");
            }

            // Verify technician exists if provided
            if (dto.TechnicianId.HasValue)
            {
                var technician = await _context.Users.FindAsync(dto.TechnicianId.Value);
                if (technician == null || technician.Role != "Technician")
                {
                    throw new KeyNotFoundException($"Technician with ID {dto.TechnicianId} not found.");
                }
            }

            var repair = new RepairRequest
            {
                ReferenceNumber = GenerateReferenceNumber(),
                CustomerId = dto.CustomerId,
                Device = dto.Device,
                Brand = dto.Brand,
                Model = dto.Model,
                Issue = dto.Issue,
                Description = dto.Description,
                Status = RepairStatus.Received,
                SubmittedAt = DateTime.UtcNow,
                EstimatedCompletionDays = dto.EstimatedCompletionDays,
                TechnicianId = dto.TechnicianId
            };

            await _context.RepairRequests.AddAsync(repair);
            await _context.SaveChangesAsync();

            // Create payment details if estimated cost is provided
            if (dto.EstimatedCost.HasValue)
            {
                var payment = new Payment
                {
                    RequestId = repair.RequestId,
                    TotalAmount = dto.EstimatedCost.Value,
                    AdvancedPayment = null
                };
                
                await _context.Payments.AddAsync(payment);
                await _context.SaveChangesAsync();
            }

            return repair;
        }

        public async Task UpdateRepairAsync(int repairId, AdminRepairDto dto)
        {
            _logger.LogInformation($"Updating repair with ID: {repairId}.");
            var repair = await _context.RepairRequests.FindAsync(repairId);
            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            // Verify customer exists
            var customer = await _context.Users.FindAsync(dto.CustomerId);
            if (customer == null || customer.Role != "Customer")
            {
                throw new KeyNotFoundException($"Customer with ID {dto.CustomerId} not found.");
            }

            // Verify technician exists if provided
            if (dto.TechnicianId.HasValue)
            {
                var technician = await _context.Users.FindAsync(dto.TechnicianId.Value);
                if (technician == null || technician.Role != "Technician")
                {
                    throw new KeyNotFoundException($"Technician with ID {dto.TechnicianId} not found.");
                }
            }

            repair.CustomerId = dto.CustomerId;
            repair.Device = dto.Device;
            repair.Brand = dto.Brand;
            repair.Model = dto.Model;
            repair.Issue = dto.Issue;
            repair.Description = dto.Description;
            repair.EstimatedCompletionDays = dto.EstimatedCompletionDays;
            repair.TechnicianId = dto.TechnicianId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteRepairAsync(int repairId)
        {
            _logger.LogInformation($"Deleting repair with ID: {repairId}.");
            var repair = await _context.RepairRequests
                .Include(r => r.PaymentDetails)
                .FirstOrDefaultAsync(r => r.RequestId == repairId);

            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            _context.RepairRequests.Remove(repair);
            await _context.SaveChangesAsync();
        }

        public async Task AssignTechnicianAsync(int repairId, int technicianId)
        {
            _logger.LogInformation($"Assigning technician {technicianId} to repair {repairId}.");
            
            var repair = await _context.RepairRequests.FindAsync(repairId);
            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            var technician = await _context.Users.FindAsync(technicianId);
            if (technician == null || technician.Role != "Technician")
            {
                throw new KeyNotFoundException($"Technician with ID {technicianId} not found.");
            }

            repair.TechnicianId = technicianId;
            if (repair.Status == RepairStatus.Received) // If status is "Received", change to "In Progress"
            {
                repair.Status = RepairStatus.InProgress;
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateRepairStatusAsync(int repairId, UpdateRepairStatusDto dto)
        {
            _logger.LogInformation($"Updating repair status for repair {repairId} to {dto.Status}.");
            
            var repair = await _context.RepairRequests.FindAsync(repairId);
            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            repair.Status = (RepairStatus)dto.Status;

            await _context.SaveChangesAsync();
        }

        public async Task UpdatePaymentAsync(int repairId, PaymentDto dto)
        {
            _logger.LogInformation($"Updating payment for repair {repairId}.");
            
            var repair = await _context.RepairRequests
                .Include(r => r.PaymentDetails)
                .FirstOrDefaultAsync(r => r.RequestId == repairId);

            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            if (repair.PaymentDetails == null)
            {
                repair.PaymentDetails = new Payment
                {
                    RequestId = repairId,
                    TotalAmount = dto.Amount,
                    AdvancedPayment = dto.AdvancedPayment,
                    PaymentDate = DateTime.UtcNow
                };
                await _context.Payments.AddAsync(repair.PaymentDetails);
            }
            else
            {
                repair.PaymentDetails.TotalAmount = dto.Amount;
                repair.PaymentDetails.AdvancedPayment = dto.AdvancedPayment;
                repair.PaymentDetails.PaymentDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task MarkReadyForDeliveryAsync(int repairId)
        {
            _logger.LogInformation($"Marking repair {repairId} as ready for delivery.");
            
            var repair = await _context.RepairRequests
                .Include(r => r.PaymentDetails)
                .FirstOrDefaultAsync(r => r.RequestId == repairId);

            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            // Ensure repair is completed
            if (repair.Status != RepairStatus.Completed)
            {
                throw new Exception("Repair must be completed before marking as ready for delivery.");
            }

            // Ensure payment is completed (payment date is set)
            if (repair.PaymentDetails == null || repair.PaymentDetails.PaymentDate == null)
            {
                throw new Exception("Payment must be completed before marking as ready for delivery.");
            }

            repair.Status = RepairStatus.ReadyForDelivery;
            await _context.SaveChangesAsync();
        }

        #region Dashboard
        public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
        {
            _logger.LogInformation("Fetching dashboard statistics.");

            var totalUsers = await _context.Users.CountAsync();
            var totalCustomers = await _context.Users.CountAsync(u => u.Role == "Customer");
            var totalTechnicians = await _context.Users.CountAsync(u => u.Role == "Technician");
            var totalRepairs = await _context.RepairRequests.CountAsync();
            var pendingRepairs = await _context.RepairRequests.CountAsync(r => r.Status == RepairStatus.Received);
            var inProgressRepairs = await _context.RepairRequests.CountAsync(r => r.Status == RepairStatus.InProgress);
            var completedRepairs = await _context.RepairRequests.CountAsync(r => r.Status == RepairStatus.Completed);
            var readyForDeliveryRepairs = await _context.RepairRequests.CountAsync(r => r.Status == RepairStatus.ReadyForDelivery);

            var totalRevenue = await _context.Payments
                .Where(p => p.PaymentDate != null)
                .SumAsync(p => p.TotalAmount);

            return new AdminDashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalCustomers = totalCustomers,
                TotalTechnicians = totalTechnicians,
                TotalRepairs = totalRepairs,
                PendingRepairs = pendingRepairs,
                InProgressRepairs = inProgressRepairs,
                CompletedRepairs = completedRepairs,
                ReadyForDeliveryRepairs = readyForDeliveryRepairs,
                TotalRevenue = totalRevenue
            };
        }
        #endregion

        #region Helper Methods
        private string GenerateReferenceNumber()
        {
            return Guid.NewGuid().ToString("N")[..8].ToUpper();
        }

        public Task<IEnumerable<RepairRequest>> GetAllRepairsAsync()
        {
            throw new NotImplementedException();
        }
        #endregion
    }
}
