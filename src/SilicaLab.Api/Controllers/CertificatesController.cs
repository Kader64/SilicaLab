using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Common;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/certificates")]
public class CertificatesController(ICertificateService certificateService) : ControllerBase
{
    [HttpGet("my")]
    [Authorize(Policy = Policies.CanLearn)]
    public async Task<IResult> GetMyCertificates()
    {
        var result = await certificateService.GetMyCertificatesAsync(GetCurrentUserId());

        return result.Match(
            certificates => Results.Ok(certificates),
            errors => errors.ToProblem());
    }

    [HttpGet("verify/{code}")]
    [AllowAnonymous]
    public async Task<IResult> VerifyCertificate(string code)
    {
        var result = await certificateService.VerifyCertificateAsync(code);

        return result.Match(
            verification => Results.Ok(verification),
            errors => errors.ToProblem());
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}