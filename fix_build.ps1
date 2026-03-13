$src = "d:\project\career website new\career-website-fullstack\client\src\components"

function ReplaceFile($Path, $From, $To) {
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match [regex]::Escape($From)) {
            $newContent = $content.Replace($From, $To)
            Set-Content -Path $Path -Value $newContent -NoNewline
            Write-Host "Replaced in $Path"
        }
    }
}

$a = "import { getToken, getUser } from '../utils/auth';"

# 1. Unused imports
ReplaceFile "$src\AILearningAssistant.tsx" $a "import { getUser } from '../utils/auth';"
ReplaceFile "$src\Achievements.tsx" $a "import { getToken } from '../utils/auth';"
ReplaceFile "$src\LearningRoadmap.tsx" $a "import { getToken } from '../utils/auth';"
ReplaceFile "$src\MyProjects.tsx" $a "import { getToken } from '../utils/auth';"
ReplaceFile "$src\Onboarding.tsx" $a "import { getUser } from '../utils/auth';"
ReplaceFile "$src\ProjectSetupModal.tsx" $a "import { getUser } from '../utils/auth';"
ReplaceFile "$src\WorkflowLifecycle.tsx" $a "import { getUser } from '../utils/auth';"

# For files where BOTH are unused we must replace with empty line or just remove it
$b = "import { getToken, getUser } from '../utils/auth';" + [Environment]::NewLine
ReplaceFile "$src\InterviewGuide.tsx" $b ""
ReplaceFile "$src\ProjectWorkspace.tsx" $b ""
ReplaceFile "$src\Workspaces.tsx" $b ""

# 2. Fix the {} type errors. JSON.parse returns `any` but TS strict mode might be getting confused by the fallback `{}`
ReplaceFile "$src\Onboarding.tsx" "JSON.parse(sessionStorage.getItem('user') || '{}');" "JSON.parse(sessionStorage.getItem('user') || '{}') as any;"
ReplaceFile "$src\Portfolio.tsx" "JSON.parse(sessionStorage.getItem('user') || '{}');" "JSON.parse(sessionStorage.getItem('user') || '{}') as any;"
ReplaceFile "$src\Profile.tsx" "JSON.parse(sessionStorage.getItem('user') || '{}');" "JSON.parse(sessionStorage.getItem('user') || '{}') as any;"
ReplaceFile "$src\Dashboard.tsx" "JSON.parse(sessionStorage.getItem('user') || '{}');" "JSON.parse(sessionStorage.getItem('user') || '{}') as any;"

# Make sure we don't have dangling ones
ReplaceFile "$src\InterviewGuide.tsx" $a ""
ReplaceFile "$src\ProjectWorkspace.tsx" $a ""
ReplaceFile "$src\Workspaces.tsx" $a ""

Write-Host "Done"
