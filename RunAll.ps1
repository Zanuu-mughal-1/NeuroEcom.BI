# Open Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; dotnet run"

# Open Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Open Ecommerce in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `'nanoo''selectric`'; npm run dev"
