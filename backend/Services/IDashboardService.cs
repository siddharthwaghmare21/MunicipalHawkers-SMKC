using backend.DTOs;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardStatsAsync();
    }
}
