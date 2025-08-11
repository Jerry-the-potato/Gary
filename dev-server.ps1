# 開發伺服器管理腳本
# 使用方法: .\dev-server.ps1 [start|stop|restart|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "start-bg", "start-new")]
    [string]$Action = "start"
)

$ClientAppPath = "clientapp"
$ProcessName = "node"

function Get-DevServerStatus {
    $viteProcesses = Get-Process | Where-Object {
        $_.ProcessName -eq $ProcessName -and
        $_.CommandLine -like "*vite*"
    } 2>$null
    return $viteProcesses
}

function Start-DevServer {
    param([bool]$Background = $false, [bool]$NewWindow = $false)

    Write-Host "🚀 啟動開發伺服器..." -ForegroundColor Green

    if (-not (Test-Path $ClientAppPath)) {
        Write-Host "❌ 找不到 clientapp 目錄" -ForegroundColor Red
        exit 1
    }

    Set-Location $ClientAppPath

    if ($NewWindow) {
        Write-Host "📱 在新視窗中啟動開發伺服器..." -ForegroundColor Yellow
        Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run dev"
    } elseif ($Background) {
        Write-Host "🔄 在背景啟動開發伺服器..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Start-Sleep 3
        Write-Host "✅ 開發伺服器已在背景啟動" -ForegroundColor Green
        Write-Host "🌐 請前往 http://localhost:5173" -ForegroundColor Cyan
    } else {
        Write-Host "📋 在當前視窗啟動開發伺服器..." -ForegroundColor Yellow
        npm run dev
    }
}

function Stop-DevServer {
    Write-Host "🛑 停止開發伺服器..." -ForegroundColor Yellow

    $processes = Get-DevServerStatus
    if ($processes) {
        foreach ($process in $processes) {
            Write-Host "📋 終止進程 PID: $($process.Id)" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force
        }
        Write-Host "✅ 開發伺服器已停止" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ 沒有正在運行的開發伺服器" -ForegroundColor Blue
    }
}

function Show-DevServerStatus {
    Write-Host "📊 開發伺服器狀態檢查..." -ForegroundColor Cyan

    $processes = Get-DevServerStatus
    if ($processes) {
        Write-Host "✅ 開發伺服器正在運行:" -ForegroundColor Green
        foreach ($process in $processes) {
            Write-Host "   PID: $($process.Id), 記憶體: $([math]::Round($process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
        }
        Write-Host "🌐 應該可以訪問: http://localhost:5173" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 開發伺服器未運行" -ForegroundColor Red
    }
}

# 主要邏輯
switch ($Action) {
    "start" { Start-DevServer }
    "start-bg" { Start-DevServer -Background $true }
    "start-new" { Start-DevServer -NewWindow $true }
    "stop" { Stop-DevServer }
    "restart" {
        Stop-DevServer
        Start-Sleep 2
        Start-DevServer -Background $true
    }
    "status" { Show-DevServerStatus }
}
