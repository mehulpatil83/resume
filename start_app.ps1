Write-Host "Starting Resume Generator Application..." -ForegroundColor Cyan

# 1. Start Temporal Dev Server
Write-Host "Step 1: Starting Temporal Dev Server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "$env:Path = [System.Environment]::GetEnvironmentVariable('Path','User') + ';' + [System.Environment]::GetEnvironmentVariable('Path','Machine'); temporal server start-dev"
Write-Host "Temporal Server started in new window." -ForegroundColor Green

# verify network connectivity nicely (optional, just pause slightly)
Start-Sleep -Seconds 3

# 2. Start Backend
Write-Host "Step 2: Starting Backend (Go)... with Supabase" -ForegroundColor Yellow
# We'll try to tidy mod first just in case
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; go mod tidy; go run main.go"
Write-Host "Backend started in new window." -ForegroundColor Green

# 3. Start AI Service
Write-Host "Step 3: Starting AI Service (Python)... on Port 8000" -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd ai-service; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"
Write-Host "AI Service started in new window." -ForegroundColor Green

# 4. Start Frontend
Write-Host "Step 4: Starting Frontend (Vite)... on Port 5173" -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Write-Host "Frontend started in new window." -ForegroundColor Green

Write-Host "All services are running!" -ForegroundColor Cyan
Write-Host "Access the App at: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8081" -ForegroundColor Gray
Write-Host "AI Service: http://localhost:8000" -ForegroundColor Gray
Write-Host "Temporal UI: http://localhost:8080" -ForegroundColor Gray
