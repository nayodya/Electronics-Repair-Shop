using backend.Services;
using Microsoft.Extensions.Options;
using SendGrid.Helpers.Mail;
using SendGrid;

public class SendGridSettings
{
    public required string ApiKey { get; set; }
    public required string SenderEmail { get; set; }
    public required string SenderName { get; set; }
}

public class SendGridEmailService : IEmailService
{
    private readonly SendGridSettings _sendGridSettings;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(IOptions<SendGridSettings> sendGridSettings, ILogger<SendGridEmailService> logger)
    {
        _sendGridSettings = sendGridSettings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        if (string.IsNullOrEmpty(_sendGridSettings.ApiKey))
        {
            _logger.LogError("SendGrid API Key is not configured.");
            return;
        }

        try
        {
            var client = new SendGridClient(_sendGridSettings.ApiKey);
            var from = new EmailAddress(_sendGridSettings.SenderEmail, _sendGridSettings.SenderName);
            var to = new EmailAddress(toEmail);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, "", body);
            var response = await client.SendEmailAsync(msg);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Email sent to {toEmail} via SendGrid.");
            }
            else
            {
                _logger.LogError($"Failed to send email via SendGrid. Status Code: {response.StatusCode}");
                // Optionally log the full response body for detailed debugging
                // var responseBody = await response.Body.ReadAsStringAsync();
                // _logger.LogError($"SendGrid response: {responseBody}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An exception occurred while sending an email to {toEmail} via SendGrid.");
        }
    }
}