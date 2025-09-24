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

        #region Payment Management Implementation
        public async Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync(PaymentFilterDto? filter = null)
        {
            _logger.LogInformation("Fetching all payments with filters.");

            var query = _context.Payments
                .Include(p => p.RepairRequest)
                    .ThenInclude(r => r.Customer!)
                .AsQueryable();

            // Apply filters
            if (filter != null)
            {
                if (filter.StartDate.HasValue)
                    query = query.Where(p => p.PaymentDate >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(p => p.PaymentDate <= filter.EndDate.Value);

                if (filter.MinAmount.HasValue)
                    query = query.Where(p => p.TotalAmount >= filter.MinAmount.Value);

                if (filter.MaxAmount.HasValue)
                    query = query.Where(p => p.TotalAmount <= filter.MaxAmount.Value);

                if (filter.IsPaid.HasValue)
                    query = query.Where(p => filter.IsPaid.Value ? p.PaymentDate != null : p.PaymentDate == null);

                if (filter.RequestId.HasValue)
                    query = query.Where(p => p.RequestId == filter.RequestId.Value);

                // Apply sorting
                if (!string.IsNullOrEmpty(filter.SortBy))
                {
                    var isAscending = filter.SortOrder?.ToUpper() == "ASC";

                    query = filter.SortBy.ToLower() switch
                    {
                        "paymentdate" => isAscending
                            ? query.OrderBy(p => p.PaymentDate)
                            : query.OrderByDescending(p => p.PaymentDate),
                        "totalamount" => isAscending
                            ? query.OrderBy(p => p.TotalAmount)
                            : query.OrderByDescending(p => p.TotalAmount),
                        "requestid" => isAscending
                            ? query.OrderBy(p => p.RequestId)
                            : query.OrderByDescending(p => p.RequestId),
                        _ => query.OrderByDescending(p => p.PaymentId)
                    };
                }

                // Apply pagination
                if (filter.PageNumber.HasValue && filter.PageSize.HasValue)
                {
                    var skip = (filter.PageNumber.Value - 1) * filter.PageSize.Value;
                    query = query.Skip(skip).Take(filter.PageSize.Value);
                }
            }

            var payments = await query.ToListAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                RequestId = p.RequestId,
                ReferenceNumber = p.RepairRequest?.ReferenceNumber,
                CustomerEmail = p.RepairRequest?.Customer?.Email ?? "",
                CustomerName = $"{p.RepairRequest?.Customer?.FirstName} {p.RepairRequest?.Customer?.LastName}".Trim(),
                Device = p.RepairRequest?.Device,
                TotalAmount = p.TotalAmount,
                AdvancedPayment = p.AdvancedPayment,
                RemainingBalance = p.TotalAmount - (p.AdvancedPayment ?? 0),
                PaymentDate = p.PaymentDate,
                IsPaid = p.PaymentDate.HasValue,
                RepairStatus = p.RepairRequest?.Status.ToString() ?? "",
                CreatedAt = p.RepairRequest?.SubmittedAt
            });
        }

        public async Task<PaymentResponseDto> GetPaymentByIdAsync(int paymentId)
        {
            _logger.LogInformation($"Fetching payment with ID: {paymentId}.");

            var payment = await _context.Payments
                .Include(p => p.RepairRequest)
                    .ThenInclude(r => r.Customer!)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null)
            {
                throw new KeyNotFoundException($"Payment with ID {paymentId} not found.");
            }

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                RequestId = payment.RequestId,
                ReferenceNumber = payment.RepairRequest?.ReferenceNumber,
                CustomerEmail = payment.RepairRequest?.Customer?.Email ?? "",
                CustomerName = $"{payment.RepairRequest?.Customer?.FirstName} {payment.RepairRequest?.Customer?.LastName}".Trim(),
                Device = payment.RepairRequest?.Device,
                TotalAmount = payment.TotalAmount,
                AdvancedPayment = payment.AdvancedPayment,
                RemainingBalance = payment.TotalAmount - (payment.AdvancedPayment ?? 0),
                PaymentDate = payment.PaymentDate,
                IsPaid = payment.PaymentDate.HasValue,
                RepairStatus = payment.RepairRequest?.Status.ToString() ?? "",
                CreatedAt = payment.RepairRequest?.SubmittedAt
            };
        }

        public async Task<PaymentResponseDto> GetPaymentByRepairIdAsync(int repairId)
        {
            _logger.LogInformation($"Fetching payment for repair ID: {repairId}.");

            var payment = await _context.Payments
                .Include(p => p.RepairRequest)
                    .ThenInclude(r => r.Customer!)
                .FirstOrDefaultAsync(p => p.RequestId == repairId);

            if (payment == null)
            {
                throw new KeyNotFoundException($"Payment for repair ID {repairId} not found.");
            }

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                RequestId = payment.RequestId,
                ReferenceNumber = payment.RepairRequest?.ReferenceNumber,
                CustomerEmail = payment.RepairRequest?.Customer?.Email ?? "",
                CustomerName = $"{payment.RepairRequest?.Customer?.FirstName} {payment.RepairRequest?.Customer?.LastName}".Trim(),
                Device = payment.RepairRequest?.Device,
                TotalAmount = payment.TotalAmount,
                AdvancedPayment = payment.AdvancedPayment,
                RemainingBalance = payment.TotalAmount - (payment.AdvancedPayment ?? 0),
                PaymentDate = payment.PaymentDate,
                IsPaid = payment.PaymentDate.HasValue,
                RepairStatus = payment.RepairRequest?.Status.ToString() ?? "",
                CreatedAt = payment.RepairRequest?.SubmittedAt
            };
        }

        public async Task<Payment> CreatePaymentAsync(int repairId, CreatePaymentDto dto)
        {
            _logger.LogInformation($"Creating payment for repair ID: {repairId}.");

            var repair = await _context.RepairRequests.FindAsync(repairId);
            if (repair == null)
            {
                throw new KeyNotFoundException($"Repair with ID {repairId} not found.");
            }

            // Check if payment already exists for this repair
            var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.RequestId == repairId);
            if (existingPayment != null)
            {
                throw new Exception($"Payment already exists for repair ID {repairId}.");
            }

            var payment = new Payment
            {
                RequestId = repairId,
                TotalAmount = dto.TotalAmount,
                AdvancedPayment = dto.AdvancedPayment,
                PaymentDate = dto.PaymentDate
            };

            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task UpdatePaymentAsync(int paymentId, UpdatePaymentDto dto)
        {
            _logger.LogInformation($"Updating payment with ID: {paymentId}.");

            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new KeyNotFoundException($"Payment with ID {paymentId} not found.");
            }

            payment.TotalAmount = dto.TotalAmount;
            payment.AdvancedPayment = dto.AdvancedPayment;
            if (dto.PaymentDate.HasValue)
            {
                payment.PaymentDate = dto.PaymentDate;
            }

            await _context.SaveChangesAsync();
        }

        public async Task MarkPaymentAsPaidAsync(int paymentId, MarkPaymentPaidDto dto)
        {
            _logger.LogInformation($"Marking payment {paymentId} as paid.");

            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new KeyNotFoundException($"Payment with ID {paymentId} not found.");
            }

            payment.PaymentDate = dto.PaymentDate ?? DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task DeletePaymentAsync(int paymentId)
        {
            _logger.LogInformation($"Deleting payment with ID: {paymentId}.");

            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new KeyNotFoundException($"Payment with ID {paymentId} not found.");
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
        }

        public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            _logger.LogInformation("Fetching payment statistics.");

            var query = _context.Payments.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(p => p.PaymentDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(p => p.PaymentDate <= endDate.Value);

            var allPayments = await query.ToListAsync();
            var paidPayments = allPayments.Where(p => p.PaymentDate.HasValue).ToList();

            var monthlyStats = paidPayments
                .Where(p => p.PaymentDate.HasValue)
                .GroupBy(p => new { p.PaymentDate!.Value.Year, p.PaymentDate!.Value.Month })
                .Select(g => new MonthlyPaymentDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy"),
                    Revenue = g.Sum(p => p.TotalAmount),
                    PaymentCount = g.Count()
                })
                .OrderBy(m => m.Year)
                .ThenBy(m => m.Month)
                .ToList();

            return new PaymentStatisticsDto
            {
                TotalPayments = allPayments.Count,
                PaidPayments = paidPayments.Count,
                PendingPayments = allPayments.Count - paidPayments.Count,
                TotalRevenue = paidPayments.Sum(p => p.TotalAmount),
                PendingAmount = allPayments.Where(p => !p.PaymentDate.HasValue).Sum(p => p.TotalAmount),
                AveragePaymentAmount = allPayments.Any() ? allPayments.Average(p => p.TotalAmount) : 0,
                TotalAdvancedPayments = allPayments.Sum(p => p.AdvancedPayment ?? 0),
                MonthlyPayments = monthlyStats
            };
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetPendingPaymentsAsync()
        {
            _logger.LogInformation("Fetching pending payments.");

            var payments = await _context.Payments
                .Where(p => p.PaymentDate == null)
                .Include(p => p.RepairRequest)
                    .ThenInclude(r => r.Customer!)
                .ToListAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                RequestId = p.RequestId,
                ReferenceNumber = p.RepairRequest?.ReferenceNumber,
                CustomerEmail = p.RepairRequest?.Customer?.Email ?? "",
                CustomerName = $"{p.RepairRequest?.Customer?.FirstName} {p.RepairRequest?.Customer?.LastName}".Trim(),
                Device = p.RepairRequest?.Device,
                TotalAmount = p.TotalAmount,
                AdvancedPayment = p.AdvancedPayment,
                RemainingBalance = p.TotalAmount - (p.AdvancedPayment ?? 0),
                PaymentDate = p.PaymentDate,
                IsPaid = false,
                RepairStatus = p.RepairRequest?.Status.ToString() ?? "",
                CreatedAt = p.RepairRequest?.SubmittedAt
            });
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetCompletedPaymentsAsync()
        {
            _logger.LogInformation("Fetching completed payments.");

            var payments = await _context.Payments
                .Where(p => p.PaymentDate != null)
                .Include(p => p.RepairRequest)
                    .ThenInclude(r => r.Customer)
                .ToListAsync();

            return payments.Select(p => new PaymentResponseDto
            {
                PaymentId = p.PaymentId,
                RequestId = p.RequestId,
                ReferenceNumber = p.RepairRequest?.ReferenceNumber,
                CustomerEmail = p.RepairRequest?.Customer?.Email ?? "",
                CustomerName = $"{p.RepairRequest?.Customer?.FirstName} {p.RepairRequest?.Customer?.LastName}".Trim(),
                Device = p.RepairRequest?.Device,
                TotalAmount = p.TotalAmount,
                AdvancedPayment = p.AdvancedPayment,
                RemainingBalance = p.TotalAmount - (p.AdvancedPayment ?? 0),
                PaymentDate = p.PaymentDate,
                IsPaid = true,
                RepairStatus = p.RepairRequest?.Status.ToString() ?? "",
                CreatedAt = p.RepairRequest?.SubmittedAt
            });
        }
        #endregion

        public async Task<IEnumerable<RepairRequest>> GetAllRepairsAsync()
        {
            _logger.LogInformation("Fetching all repairs for admin.");
            return await _context.RepairRequests
                .Include(r => r.Customer)
                .Include(r => r.Technician)
                .Include(r => r.PaymentDetails)
                .ToListAsync();
        }
        #endregion
    }

}
