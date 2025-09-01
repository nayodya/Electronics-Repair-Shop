using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :
        base(options)
        { }
        public DbSet<User> Users { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<RepairRequest> RepairRequests { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<RepairPart> RepairParts { get; set; }
        public DbSet<StatusHistory> StatusHistories { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure a unique index on the Email column to prevent duplicates
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<RepairRequest>()
            .HasIndex(r => r.ReferenceNumber)
            .IsUnique();

        }

    }
}
