@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 AI思维导图项目设置向导
echo ================================

REM 检查Node.js
echo 📋 检查环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js 18+
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js版本: %NODE_VERSION%

REM 检查npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到npm
    pause
    exit /b 1
)

for /f %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm版本: %NPM_VERSION%

REM 安装依赖
echo.
echo 📦 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

REM 设置环境变量
echo.
echo ⚙️  配置环境变量...
if not exist ".env.local" (
    if exist ".env.local.example" (
        copy ".env.local.example" ".env.local" >nul
        echo ✅ 已创建 .env.local 文件
    ) else (
        echo ⚠️  警告: 未找到 .env.local.example 文件
    )
) else (
    echo ✅ .env.local 文件已存在
)

REM AI配置向导
echo.
echo 🤖 AI服务配置向导
echo ==================
set /p configure_ai="您想要配置AI服务吗？(y/n): "

if /i "%configure_ai%"=="y" (
    echo.
    echo 请选择AI提供商:
    echo 1^) OpenAI ^(推荐^)
    echo 2^) Azure OpenAI
    echo 3^) Anthropic Claude
    echo 4^) Google Gemini
    echo 5^) DeepSeek ^(V3/R1^)
    echo 6^) 本地Ollama
    echo 7^) 跳过配置

    set /p provider_choice="请输入选择 (1-6): "

    if "!provider_choice!"=="1" (
        echo.
        echo 📝 配置OpenAI...
        set /p openai_key="请输入您的OpenAI API Key (sk-...): "

        if not "!openai_key!"=="" (
            REM 更新.env.local文件
            powershell -Command "(Get-Content .env.local) -replace '^# OPENAI_API_KEY=.*', 'OPENAI_API_KEY=!openai_key!' -replace '^OPENAI_API_KEY=.*', 'OPENAI_API_KEY=!openai_key!' | Set-Content .env.local"
            powershell -Command "(Get-Content .env.local) -replace '^DEFAULT_AI_PROVIDER=.*', 'DEFAULT_AI_PROVIDER=openai' | Set-Content .env.local"
            echo ✅ OpenAI配置完成
        ) else (
            echo ⚠️  跳过OpenAI配置
        )
    ) else if "!provider_choice!"=="2" (
        echo 📝 Azure OpenAI配置需要多个参数，请手动编辑 .env.local 文件
        echo 参考 AI_CONFIG_GUIDE.md 获取详细说明
    ) else if "!provider_choice!"=="3" (
        echo.
        echo 📝 配置Anthropic Claude...
        set /p anthropic_key="请输入您的Anthropic API Key: "

        if not "!anthropic_key!"=="" (
            powershell -Command "(Get-Content .env.local) -replace '^# ANTHROPIC_API_KEY=.*', 'ANTHROPIC_API_KEY=!anthropic_key!' -replace '^ANTHROPIC_API_KEY=.*', 'ANTHROPIC_API_KEY=!anthropic_key!' | Set-Content .env.local"
            powershell -Command "(Get-Content .env.local) -replace '^DEFAULT_AI_PROVIDER=.*', 'DEFAULT_AI_PROVIDER=anthropic' | Set-Content .env.local"
            echo ✅ Anthropic配置完成
        ) else (
            echo ⚠️  跳过Anthropic配置
        )
    ) else if "!provider_choice!"=="4" (
        echo.
        echo 📝 配置Google Gemini...
        set /p google_key="请输入您的Google AI API Key: "

        if not "!google_key!"=="" (
            powershell -Command "(Get-Content .env.local) -replace '^# GOOGLE_AI_API_KEY=.*', 'GOOGLE_AI_API_KEY=!google_key!' -replace '^GOOGLE_AI_API_KEY=.*', 'GOOGLE_AI_API_KEY=!google_key!' | Set-Content .env.local"
            powershell -Command "(Get-Content .env.local) -replace '^DEFAULT_AI_PROVIDER=.*', 'DEFAULT_AI_PROVIDER=google' | Set-Content .env.local"
            echo ✅ Google Gemini配置完成
        ) else (
            echo ⚠️  跳过Google Gemini配置
        )
    ) else if "!provider_choice!"=="5" (
        echo.
        echo 📝 配置DeepSeek...
        set /p deepseek_key="请输入您的DeepSeek API Key: "

        if not "!deepseek_key!"=="" (
            powershell -Command "(Get-Content .env.local) -replace '^# DEEPSEEK_API_KEY=.*', 'DEEPSEEK_API_KEY=!deepseek_key!' -replace '^DEEPSEEK_API_KEY=.*', 'DEEPSEEK_API_KEY=!deepseek_key!' | Set-Content .env.local"
            powershell -Command "(Get-Content .env.local) -replace '^DEFAULT_AI_PROVIDER=.*', 'DEFAULT_AI_PROVIDER=deepseek' | Set-Content .env.local"
            echo ✅ DeepSeek配置完成
            echo 💡 提示: 默认使用 deepseek-chat (V3)，可在配置中切换到 deepseek-reasoner (R1)
        ) else (
            echo ⚠️  跳过DeepSeek配置
        )
    ) else if "!provider_choice!"=="6" (
        echo.
        echo 📝 配置本地Ollama...
        echo 请确保Ollama已安装并运行在 http://localhost:11434

        powershell -Command "(Get-Content .env.local) -replace '^DEFAULT_AI_PROVIDER=.*', 'DEFAULT_AI_PROVIDER=ollama' | Set-Content .env.local"
        echo ✅ Ollama配置完成
        echo 💡 提示: 请运行 'ollama pull llama2' 下载模型
    ) else (
        echo ⚠️  跳过AI配置
    )
) else (
    echo ⚠️  跳过AI配置
)

echo.
echo 🎉 设置完成！
echo ==============
echo.
echo 📚 接下来的步骤:
echo 1. 运行 'npm run dev' 启动开发服务器
echo 2. 打开 http://localhost:3000 查看应用
echo 3. 点击思维导图节点开始与AI对话
echo.
echo 📖 更多信息:
echo - AI配置指南: AI_CONFIG_GUIDE.md
echo - 项目文档: README.md
echo.
set /p start_dev="🚀 现在启动开发服务器吗？(y/n): "

if /i "%start_dev%"=="y" (
    echo.
    echo 🚀 启动开发服务器...
    call npm run dev
) else (
    echo.
    echo ✅ 设置完成！运行 'npm run dev' 启动应用
)

pause
