$onboarding = "d:\project\career website new\career-website-fullstack\client\src\components\Onboarding.tsx"
$portfolio = "d:\project\career website new\career-website-fullstack\client\src\components\Portfolio.tsx"
$profileFile = "d:\project\career website new\career-website-fullstack\client\src\components\Profile.tsx"

$text1 = Get-Content $onboarding -Raw
$text1 = $text1.Replace("formData.append('user', user);", "formData.append('user', JSON.stringify(user));")
$text1 = $text1.Replace("formData.append('userId', user.id);", "formData.append('userId', (user as any).id);")
Set-Content $onboarding $text1 -NoNewline

$text2 = Get-Content $portfolio -Raw
$text2 = $text2.Replace("project.tags.split(',')", "String((project as any).tags || '').split(',')")
$text2 = $text2.Replace("role={project.role}", "role={(project as any).role}")
Set-Content $portfolio $text2 -NoNewline

$text3 = Get-Content $profileFile -Raw
$text3 = $text3.Replace("role.toLowerCase()", "String(role).toLowerCase()")
Set-Content $profileFile $text3 -NoNewline

Write-Host "Done specific fixes"
