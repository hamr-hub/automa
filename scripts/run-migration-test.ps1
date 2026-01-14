$env:SUPABASE_URL = "YOUR_SUPABASE_URL"
$env:SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
$env:TEST_EMAIL = "test@example.com"
$env:TEST_PASSWORD = "password"

# Uncomment and set real values above, or set them in your environment before running.

Write-Host "Running Supabase Migration Test..." -ForegroundColor Cyan

# Check if credentials are set (simple check)
if ($env:SUPABASE_URL -eq "YOUR_SUPABASE_URL") {
    Write-Host "Warning: Default credentials detected. Please edit this script or set environment variables." -ForegroundColor Yellow
}

node scripts/migration-test-full.mjs
