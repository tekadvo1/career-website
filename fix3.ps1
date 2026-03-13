$files = @(
    "d:\project\career website new\career-website-fullstack\client\src\components\Onboarding.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Portfolio.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Profile.tsx",
    "d:\project\career website new\career-website-fullstack\client\src\components\Dashboard.tsx"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $text = Get-Content -Path $f -Raw
        $text = $text.Replace("const user = (JSON.parse(sessionStorage.getItem('user') || '{}') as any);", "const user: any = JSON.parse(sessionStorage.getItem('user') || '{}');")
        $text = $text.Replace("const user = JSON.parse(sessionStorage.getItem('user') || '{}');", "const user: any = JSON.parse(sessionStorage.getItem('user') || '{}');")
        Set-Content -Path $f -Value $text -NoNewline
        Write-Host "Fixed cast syntax: $f"
    }
}
