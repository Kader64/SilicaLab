using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;
using SilicaLab.Api.Dtos;
using System.Security.Claims;
using SilicaLab.Api.Common;

namespace SilicaLab.Api.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet]
    public async Task<IResult> GetCourses([FromQuery] CourseQueryParams query)
    {
        var result = await courseService.GetPublishedCoursesAsync(query);

        return result.Match(
            courses => Results.Ok(courses),
            errors => errors.ToProblem());
    }

    [HttpGet("categories")]
    public async Task<IResult> GetCategories()
    {
        var result = await courseService.GetCategoriesAsync();

        return result.Match(
            categories => Results.Ok(categories),
            errors => errors.ToProblem());
    }

    [HttpGet("{id:guid}")]
    public async Task<IResult> GetCourseById(Guid id)
    {
        var result = await courseService.GetCourseByIdAsync(
            id,
            GetCurrentUserId(),
            User.IsInRole(Roles.Admin));

        return result.Match(
            course => Results.Ok(course),
            errors => errors.ToProblem());
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(sub!);
    }
}