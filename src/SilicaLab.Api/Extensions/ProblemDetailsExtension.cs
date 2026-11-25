using ErrorOr;

namespace SilicaLab.Api.Extensions;

// Maps ErrorOr to HTTP error code
public static class ProblemDetailsExtensions
{
    public static IResult ToProblem(this List<Error> errors)
    {
        if (errors.Count == 0)
            return Results.Problem();

        if (errors.All(e => e.Type == ErrorType.Validation))
            return errors.ToValidationProblem();

        return errors[0].ToProblem();
    }

    public static IResult ToProblem(this Error error)
    {
        var statusCode = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            _ => error.NumericType >= 400 ? error.NumericType : StatusCodes.Status500InternalServerError
        };

        return Results.Problem(
            detail: error.Description,
            statusCode: statusCode,
            extensions: new Dictionary<string, object?>
            {
                ["code"] = error.Code
            });
    }

    private static IResult ToValidationProblem(this List<Error> errors)
    {
        var errorDict = errors
            .GroupBy(e => e.Code)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.Description).ToArray());

        return Results.ValidationProblem(errorDict);
    }
}