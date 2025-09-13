using System.ComponentModel.DataAnnotations;

namespace backend.Dto
{
    public class UpdateEstimatedDaysDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Estimated days must be at least 1.")]
        public int EstimatedCompletionDays { get; set; }
    }
}
