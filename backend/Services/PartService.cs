using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class PartService : IPartService
    {
        private readonly ApplicationDbContext _context;

        public PartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Part>> GetAllPartsAsync()
        {
            return await _context.Parts.ToListAsync();
        }

        public async Task<Part> CreatePartAsync(Part part)
        {
            _context.Parts.Add(part);
            await _context.SaveChangesAsync();
            return part;
        }
    }
}
