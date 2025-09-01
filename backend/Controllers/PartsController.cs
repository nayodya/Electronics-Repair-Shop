using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Models;
using backend.Services;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Technician")] // Staff can view parts
public class PartsController : ControllerBase
{
    private readonly IPartService _partService;

    public PartsController(IPartService partService)
    {
        _partService = partService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllParts()
    {
        var parts = await _partService.GetAllPartsAsync();
        return Ok(parts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")] // Only Admins can create new parts
    public async Task<IActionResult> CreatePart([FromBody] Part part)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdPart = await _partService.CreatePartAsync(part);
        return CreatedAtAction(nameof(GetAllParts), new { id = createdPart.PartId }, createdPart);
    }
}
