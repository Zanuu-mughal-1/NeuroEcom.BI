# Force close any existing backend/frontend processes to prevent "file is locked" errors
Write-Host "Cleaning up old processes..."
Stop-Process -Name "dotnet" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Ensure local SQL Express service is running
Write-Host "Starting SQL Server Express service..."
Start-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue
Start-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue

# Open Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; dotnet run"

# Open Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" 