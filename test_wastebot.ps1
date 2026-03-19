param(
  [string]$Question = "How do I segregate waste at home?",
  [string]$BackendUrl = "http://localhost:3000"
)

$uri = "$BackendUrl/wastebot/chat"
$payload = @{ question = $Question } | ConvertTo-Json

try {
  $resp = Invoke-WebRequest -Method Post -Uri $uri -ContentType "application/json" -Body $payload -TimeoutSec 60
  Write-Host ("{0} {1}" -f $resp.StatusCode, $resp.StatusDescription)
  $resp.Content
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
    $code = [int]$_.Exception.Response.StatusCode
    Write-Host ("{0} ERROR" -f $code)
  } else {
    Write-Host "REQUEST FAILED"
  }
  Write-Host $_.Exception.Message
}

