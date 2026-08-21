# Quick smoke test for every Agro-Cloud API endpoint (Windows PowerShell version)
# Run this AFTER starting the server (npm start, in server/), from any folder.

$Base = "http://localhost:5000/api"

function Check($label, $path) {
    Write-Host -NoNewline "-> $label ... "
    try {
        $resp = Invoke-RestMethod -Uri "$Base$path" -Method Get -TimeoutSec 5
        $json = ($resp | ConvertTo-Json -Compress -Depth 4)
        if ($json.Length -gt 150) { $json = $json.Substring(0,150) + "..." }
        Write-Host "OK" -ForegroundColor Green -NoNewline
        Write-Host "  $json"
    } catch {
        Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Check "health"                  "/health"
Check "field conditions (live)" "/advisory/field-conditions"
Check "advisory alerts"         "/advisory/alerts"
Check "npk levels"              "/advisory/npk"
Check "irrigation schedule"     "/advisory/irrigation"
Check "soil moisture trend"     "/advisory/moisture-trend"
Check "recent scans"            "/disease/scans"
Check "mandi trend"             "/market/trend"
Check "mandi comparison"        "/market/comparison"
Check "buyers"                  "/market/buyers"
Check "harvest window"          "/market/harvest-window"
Check "farmers list"            "/farmers"

Write-Host ""
Write-Host "-> POST /disease/scan (image upload) ..."

# Generate a tiny solid-green PNG in-memory as a fake leaf image, no external tools needed
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 50,50
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(40,160,40))
$tmpPath = Join-Path $env:TEMP "leaf.png"
$bmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

try {
    # Build multipart/form-data manually — works on both Windows PowerShell 5.1 and PowerShell 7+
    # (the -Form parameter on Invoke-RestMethod only exists on 7+)
    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($tmpPath)
    $fileEncoding = [System.Text.Encoding]::GetEncoding("ISO-8859-1")
    $fileContent = $fileEncoding.GetString($fileBytes)

    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"crop`"",
        "",
        "Cotton",
        "--$boundary",
        "Content-Disposition: form-data; name=`"image`"; filename=`"leaf.png`"",
        "Content-Type: image/png",
        "",
        $fileContent,
        "--$boundary--",
        ""
    ) -join "`r`n"

    $bodyBytes = $fileEncoding.GetBytes($bodyLines)

    $result = Invoke-RestMethod -Uri "$Base/disease/scan" -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyBytes -TimeoutSec 10

    $result | ConvertTo-Json -Depth 5
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
}
