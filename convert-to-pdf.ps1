# PowerShell script to convert all markdown files to PDF
# Uses the markdown-pdf VS Code extension

Write-Host "Converting Markdown files to PDF..." -ForegroundColor Green

# List of markdown files to convert
$markdownFiles = @(
    "INTERVIEW_GUIDE.md",
    "COMMENTED_FILES_SUMMARY.md",
    "QUICK_REFERENCE.md",
    "CODE_WALKTHROUGH.md",
    "TECH_STACK.md"
)

foreach ($file in $markdownFiles) {
    if (Test-Path $file) {
        Write-Host "Converting $file..." -ForegroundColor Yellow
        
        # Open file in VS Code and convert to PDF
        # Note: You'll need to manually right-click and select "Markdown PDF: Export (pdf)"
        # Or use Ctrl+Shift+P and type "Markdown PDF: Export (pdf)"
        
        code $file
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nTo convert to PDF:" -ForegroundColor Cyan
Write-Host "1. Open each file in VS Code" -ForegroundColor White
Write-Host "2. Right-click in the editor" -ForegroundColor White
Write-Host "3. Select 'Markdown PDF: Export (pdf)'" -ForegroundColor White
Write-Host "   OR press Ctrl+Shift+P and type 'Markdown PDF: Export (pdf)'" -ForegroundColor White

Write-Host "`nAlternatively, use the online converter:" -ForegroundColor Cyan
Write-Host "https://www.markdowntopdf.com/" -ForegroundColor White
