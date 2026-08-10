using backend.DTOs.Auth;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
    }
}
