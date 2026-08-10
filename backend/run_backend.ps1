cd "D:\SMKC\MunicipalHawkers - SMKC\backend"
dotnet publish -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true -o .\publish
.\publish\backend.exe --urls=http://localhost:5109
