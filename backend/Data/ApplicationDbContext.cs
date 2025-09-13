using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<RepairRequest> RepairRequests { get; set; }
    public DbSet<Payment> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure a one-to-one relationship between RepairRequest and Payment
        modelBuilder.Entity<RepairRequest>()
            .HasOne(r => r.PaymentDetails)
            .WithOne(p => p.RepairRequest)
            .HasForeignKey<Payment>(p => p.RequestId);

        // Seed an Admin user
        var admin = new User
        {
            UserId = 1,
            Email = "admin@ers.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AdminPassword123"),
            Role = "Admin",
            EmailVerifiedAt = DateTime.UtcNow,
            FirstName = "Admin",
            LastName = "User"
        };
        modelBuilder.Entity<User>().HasData(admin);
    }
}
