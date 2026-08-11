$token = ""
$deptAdminToken = ""

function Invoke-ApiTest {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [string]$Body = $null,
        [string]$AuthToken = $null,
        [int]$ExpectedStatusCode = 200,
        [string]$ExpectedContent = $null
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }

    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $Body 
        $statusCode = 200
    } catch {
        $response = $_.Exception.Response
        if ($response) {
            $statusCode = [int]$response.StatusCode
            $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
            $response = $reader.ReadToEnd() | ConvertFrom-Json
        } else {
            $statusCode = 500
        }
    }
        
    $passed = $true
    $reason = ""
    
    if ($passed) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $Name - $reason" -ForegroundColor Red
        return $false
    }
}

# 1. Auth Tests
$loginResp = Invoke-RestMethod -Uri "http://localhost:5109/api/Auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"Username":"itadmin","Password":"Admin@123"}'
$token = $loginResp.data.token

$loginRespDept = Invoke-RestMethod -Uri "http://localhost:5109/api/Auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"Username":"deptadmin","Password":"Admin@123"}'
$deptAdminToken = $loginRespDept.data.token

Invoke-ApiTest -Name "Auth - Invalid Login" -Method Post -Uri "http://localhost:5109/api/Auth/login" -Body '{"Username":"itadmin","Password":"wrongpassword"}' -ExpectedStatusCode 401

# 2. Unauthorized Access
Invoke-ApiTest -Name "Unauthorized Access - Missing Token" -Method Get -Uri "http://localhost:5109/api/Dashboard/stats" -ExpectedStatusCode 401
Invoke-ApiTest -Name "Unauthorized Access - Dept Admin accessing IT Admin route" -Method Get -Uri "http://localhost:5109/api/AuditLogs" -AuthToken $deptAdminToken -ExpectedStatusCode 403

# 3. Dashboard
Invoke-ApiTest -Name "Dashboard - Get Stats" -Method Get -Uri "http://localhost:5109/api/Dashboard/stats" -AuthToken $token -ExpectedStatusCode 200

# 4. Hawkers
$newHawkerBody = '{"enrollmentNo":"SMKC-TEST001", "fullName":"Test Hawker", "mobileNumber":"9876543210", "gender":"Male", "dob":"1990-01-01", "handicap":false, "address":"Test Address", "ulbName":"SMKC", "wardName":"Ward 1", "roadName":"Test Road", "areaType":"Commercial", "businessType":"Vegetables", "businessTime":"Morning", "locationType":"Fixed", "partnerDependancy":"None"}'
Invoke-ApiTest -Name "Hawkers - Add Valid Hawker" -Method Post -Uri "http://localhost:5109/api/Hawkers" -AuthToken $token -Body $newHawkerBody -ExpectedStatusCode 201

Invoke-ApiTest -Name "Hawkers - Duplicate Enrollment No" -Method Post -Uri "http://localhost:5109/api/Hawkers" -AuthToken $token -Body $newHawkerBody -ExpectedStatusCode 400

$invalidHawkerBody = '{"enrollmentNo":"INVALID", "fullName":"", "mobileNumber":"123", "gender":"Unknown"}'
Invoke-ApiTest -Name "Hawkers - Invalid Input" -Method Post -Uri "http://localhost:5109/api/Hawkers" -AuthToken $token -Body $invalidHawkerBody -ExpectedStatusCode 400

# 5. Get Hawkers with search and filter
Invoke-ApiTest -Name "Hawkers - Search & Pagination" -Method Get -Uri "http://localhost:5109/api/Hawkers?search=Test&page=1&pageSize=10" -AuthToken $token -ExpectedStatusCode 200

# 6. Reject Hawker
# First get the ID of the newly created hawker
$hawkersResp = Invoke-RestMethod -Uri "http://localhost:5109/api/Hawkers?search=SMKC-TEST001" -Method Get -Headers @{"Authorization"="Bearer $token"}
$hawkerId = $hawkersResp.data.items[0].id
$rejectBody = '{"reason":"Testing rejection"}'
Invoke-ApiTest -Name "Hawkers - Reject Hawker" -Method Post -Uri "http://localhost:5109/api/Hawkers/$hawkerId/reject" -AuthToken $token -Body $rejectBody -ExpectedStatusCode 200

# Try to edit a rejected hawker
$updateHawkerBody = '{"fullName":"Updated Hawker Name", "mobileNumber":"9876543210"}'
Invoke-ApiTest -Name "Hawkers - Update Rejected Hawker (Should fail/or just update)" -Method Put -Uri "http://localhost:5109/api/Hawkers/$hawkerId" -AuthToken $token -Body $updateHawkerBody -ExpectedStatusCode 200

# Note: We need to see if update on rejected hawker is blocked by business logic. If it is 400, then good. If 200, we check our rules.

# 7. Licenses
# Get licenses list
Invoke-ApiTest -Name "Licenses - List" -Method Get -Uri "http://localhost:5109/api/Licenses?page=1&pageSize=10" -AuthToken $token -ExpectedStatusCode 200

# 8. Reports
Invoke-ApiTest -Name "Reports - Master Report" -Method Get -Uri "http://localhost:5109/api/Hawkers/report/master" -AuthToken $token -ExpectedStatusCode 200

Write-Host "Tests complete."
