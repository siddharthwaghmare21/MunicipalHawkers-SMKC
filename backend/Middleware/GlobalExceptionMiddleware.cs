using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace backend.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = (int)HttpStatusCode.InternalServerError;
            var message = "An internal server error occurred.";
            
            if (exception is InvalidOperationException)
            {
                statusCode = (int)HttpStatusCode.BadRequest;
                message = exception.Message;
            }
            
            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new 
            { 
                success = false, 
                message = message,
                // Do not expose exception.Message by default for 500 errors to prevent leaking DB details
            });
            
            return context.Response.WriteAsync(result);
        }
    }
}
