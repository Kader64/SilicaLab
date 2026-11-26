using System.ComponentModel.DataAnnotations;

namespace SilicaLab.Api.Dtos.Auth;

public record RegisterRequest(
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100, ErrorMessage = "Full name must not exceed 100 characters.")]
    string FullName,

    [Required(ErrorMessage = "Email is required.")]
    [MaxLength(256, ErrorMessage = "Email must not exceed 256 characters.")]
    [EmailAddress(ErrorMessage = "A valid email address is required.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(128, ErrorMessage = "Password must not exceed 128 characters.")]
    string Password,

    [Required(ErrorMessage = "Role is required.")]
    [RegularExpression("^(Student|Teacher)$", ErrorMessage = "Role must be either Student or Teacher.")]
    string Role
);

public record LoginRequest(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email address is required.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    string Password
);

public record RefreshRequest(string? RefreshToken = null);