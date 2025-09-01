using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IPartService
    {
        Task<IEnumerable<Part>> GetAllPartsAsync();
        Task<Part> CreatePartAsync(Part part);
    }
}
