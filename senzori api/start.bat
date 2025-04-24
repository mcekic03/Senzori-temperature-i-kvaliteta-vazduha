@echo off
:: Proverava da li je pokrenuto kao administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Restartujem kao administrator...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

:: Ulazak u CIITLAB API folder
cd /d "C:\Users\Win10senzori\Desktop\SenzoriMihajloCekic\senzori api"

:: Pokretanje servera pomoću npm run production
echo Pokrećem server (npm run production)...
"C:\Program Files\nodejs\npm.cmd" run production

pause
