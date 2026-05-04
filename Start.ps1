# Open Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; dotnet run"

# Open Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

#Okay
