#!/usr/bin/env bash
set -e

echo "🚀 Setting up rag-axis for local development..."

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
REQUIRED_VERSION="3.11"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python $REQUIRED_VERSION or higher is required (found $PYTHON_VERSION)"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install package in editable mode with all dev dependencies
echo "📥 Installing rag-axis in editable mode with all dependencies..."
pip install -e ".[dev,all]"

# Install pre-commit hooks
echo "🪝 Installing pre-commit hooks..."
pre-commit install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run tests: pytest"
echo "  3. Run type checking: mypy rag_axis"
echo "  4. Run linting: ruff check rag_axis"
echo ""
echo "🔥 You're ready to build! Start with:"
echo "   - rag_axis/core/types.py (domain types)"
echo "   - tests/unit/core/test_types.py (tests)"
echo ""
