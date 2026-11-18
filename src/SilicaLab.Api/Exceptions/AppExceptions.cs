namespace SilicaLab.Api.Exceptions;

public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class UnauthorizedException(string message = "Authentication is required.") : AppException(message, 401);

public class ForbiddenException(string message = "You do not have access to this resource.") : AppException(message, 403);

public class NotFoundException(string message = "Resource not found.") : AppException(message, 404);

public class ConflictException(string message) : AppException(message, 409);

public class BusinessRuleException(string message) : AppException(message, 422);

public class ValidationException : AppException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", 400) => Errors = errors;

    public ValidationException(string field, string message)
        : this(new Dictionary<string, string[]> { [field] = [message] }) { }
}
