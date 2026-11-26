using Microsoft.AspNetCore.Mvc;
using SilicaLab.Api.Dtos.Courses;
using SilicaLab.Api.Extensions;
using SilicaLab.Api.Services;

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
}