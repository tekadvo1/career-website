$files = @(
    "d:\project\career website new\career-website-fullstack\client\src\components\Onboarding.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Portfolio.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Profile.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Dashboard.tsx"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $text = Get-Content -Path $f -Raw
        $text = $text.Replace("JSON.parse(sessionStorage.getItem('user') || '{}')", "(JSON.parse(sessionStorage.getItem('user') || '{}') as any)")
        Set-Content -Path $f -Value $text -NoNewline
        Write-Host "Fixed: $f"
    }
}
