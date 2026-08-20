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
# ASPNETCORE_URLS instructs .NET to listen on that dynamic port.
CMD ASPNETCORE_URLS=http://*:$PORT dotnet backend.dll
