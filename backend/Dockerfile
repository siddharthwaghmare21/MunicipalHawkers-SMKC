# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY backend.csproj ./
RUN dotnet restore

# Copy the rest of the source code and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Run the application. 
# Render automatically injects the $PORT environment variable.
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
EXPOSE 8080 10000
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet backend.dll"]
