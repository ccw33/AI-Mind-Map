#!/bin/bash

# AI思维导图项目设置脚本
# 这个脚本将帮助您快速设置和启动AI思维导图项目

echo "🚀 AI思维导图项目设置向导"
echo "================================"

# 检查Node.js版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js版本过低，需要18+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 设置环境变量
echo ""
echo "⚙️  配置环境变量..."

if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ 已创建 .env.local 文件"
    else
        echo "⚠️  警告: 未找到 .env.local.example 文件"
    fi
else
    echo "✅ .env.local 文件已存在"
fi

# AI配置向导
echo ""
echo "🤖 AI服务配置向导"
echo "=================="
echo "您想要配置AI服务吗？(y/n)"
read -r configure_ai

if [ "$configure_ai" = "y" ] || [ "$configure_ai" = "Y" ]; then
    echo ""
    echo "请选择AI提供商:"
    echo "1) OpenAI (推荐)"
    echo "2) Azure OpenAI"
    echo "3) Anthropic Claude"
    echo "4) Google Gemini"
    echo "5) DeepSeek (V3/R1)"
    echo "6) 本地Ollama"
    echo "7) 跳过配置"

    read -r provider_choice

    case $provider_choice in
        1)
            echo ""
            echo "📝 配置OpenAI..."
            echo "请输入您的OpenAI API Key (sk-...):"
            read -r openai_key

            if [ -n "$openai_key" ]; then
                # 更新.env.local文件
                if grep -q "OPENAI_API_KEY=" .env.local; then
                    sed -i.bak "s/# OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env.local
                    sed -i.bak "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env.local
                else
                    echo "OPENAI_API_KEY=$openai_key" >> .env.local
                fi

                # 设置默认提供商
                if grep -q "DEFAULT_AI_PROVIDER=" .env.local; then
                    sed -i.bak "s/DEFAULT_AI_PROVIDER=.*/DEFAULT_AI_PROVIDER=openai/" .env.local
                else
                    echo "DEFAULT_AI_PROVIDER=openai" >> .env.local
                fi

                echo "✅ OpenAI配置完成"
            else
                echo "⚠️  跳过OpenAI配置"
            fi
            ;;
        2)
            echo "📝 Azure OpenAI配置需要多个参数，请手动编辑 .env.local 文件"
            echo "参考 AI_CONFIG_GUIDE.md 获取详细说明"
            ;;
        3)
            echo ""
            echo "📝 配置Anthropic Claude..."
            echo "请输入您的Anthropic API Key:"
            read -r anthropic_key

            if [ -n "$anthropic_key" ]; then
                if grep -q "ANTHROPIC_API_KEY=" .env.local; then
                    sed -i.bak "s/# ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/" .env.local
                    sed -i.bak "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$anthropic_key/" .env.local
                else
                    echo "ANTHROPIC_API_KEY=$anthropic_key" >> .env.local
                fi

                if grep -q "DEFAULT_AI_PROVIDER=" .env.local; then
                    sed -i.bak "s/DEFAULT_AI_PROVIDER=.*/DEFAULT_AI_PROVIDER=anthropic/" .env.local
                else
                    echo "DEFAULT_AI_PROVIDER=anthropic" >> .env.local
                fi

                echo "✅ Anthropic配置完成"
            else
                echo "⚠️  跳过Anthropic配置"
            fi
            ;;
        4)
            echo ""
            echo "📝 配置Google Gemini..."
            echo "请输入您的Google AI API Key:"
            read -r google_key

            if [ -n "$google_key" ]; then
                if grep -q "GOOGLE_AI_API_KEY=" .env.local; then
                    sed -i.bak "s/# GOOGLE_AI_API_KEY=.*/GOOGLE_AI_API_KEY=$google_key/" .env.local
                    sed -i.bak "s/GOOGLE_AI_API_KEY=.*/GOOGLE_AI_API_KEY=$google_key/" .env.local
                else
                    echo "GOOGLE_AI_API_KEY=$google_key" >> .env.local
                fi

                if grep -q "DEFAULT_AI_PROVIDER=" .env.local; then
                    sed -i.bak "s/DEFAULT_AI_PROVIDER=.*/DEFAULT_AI_PROVIDER=google/" .env.local
                else
                    echo "DEFAULT_AI_PROVIDER=google" >> .env.local
                fi

                echo "✅ Google Gemini配置完成"
            else
                echo "⚠️  跳过Google Gemini配置"
            fi
            ;;
        5)
            echo ""
            echo "📝 配置DeepSeek..."
            echo "请输入您的DeepSeek API Key:"
            read -r deepseek_key

            if [ -n "$deepseek_key" ]; then
                if grep -q "DEEPSEEK_API_KEY=" .env.local; then
                    sed -i.bak "s/# DEEPSEEK_API_KEY=.*/DEEPSEEK_API_KEY=$deepseek_key/" .env.local
                    sed -i.bak "s/DEEPSEEK_API_KEY=.*/DEEPSEEK_API_KEY=$deepseek_key/" .env.local
                else
                    echo "DEEPSEEK_API_KEY=$deepseek_key" >> .env.local
                fi

                if grep -q "DEFAULT_AI_PROVIDER=" .env.local; then
                    sed -i.bak "s/DEFAULT_AI_PROVIDER=.*/DEFAULT_AI_PROVIDER=deepseek/" .env.local
                else
                    echo "DEFAULT_AI_PROVIDER=deepseek" >> .env.local
                fi

                echo "✅ DeepSeek配置完成"
                echo "💡 提示: 默认使用 deepseek-chat (V3)，可在配置中切换到 deepseek-reasoner (R1)"
            else
                echo "⚠️  跳过DeepSeek配置"
            fi
            ;;
        6)
            echo ""
            echo "📝 配置本地Ollama..."
            echo "请确保Ollama已安装并运行在 http://localhost:11434"

            if grep -q "DEFAULT_AI_PROVIDER=" .env.local; then
                sed -i.bak "s/DEFAULT_AI_PROVIDER=.*/DEFAULT_AI_PROVIDER=ollama/" .env.local
            else
                echo "DEFAULT_AI_PROVIDER=ollama" >> .env.local
            fi

            echo "✅ Ollama配置完成"
            echo "💡 提示: 请运行 'ollama pull llama2' 下载模型"
            ;;
        *)
            echo "⚠️  跳过AI配置"
            ;;
    esac
else
    echo "⚠️  跳过AI配置"
fi

# 清理备份文件
rm -f .env.local.bak

echo ""
echo "🎉 设置完成！"
echo "=============="
echo ""
echo "📚 接下来的步骤:"
echo "1. 运行 'npm run dev' 启动开发服务器"
echo "2. 打开 http://localhost:3000 查看应用"
echo "3. 点击思维导图节点开始与AI对话"
echo ""
echo "📖 更多信息:"
echo "- AI配置指南: AI_CONFIG_GUIDE.md"
echo "- 项目文档: README.md"
echo ""
echo "🚀 现在启动开发服务器吗？(y/n)"
read -r start_dev

if [ "$start_dev" = "y" ] || [ "$start_dev" = "Y" ]; then
    echo ""
    echo "🚀 启动开发服务器..."
    npm run dev
else
    echo ""
    echo "✅ 设置完成！运行 'npm run dev' 启动应用"
fi
