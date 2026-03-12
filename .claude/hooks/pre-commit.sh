#!/bin/bash
# .claude/hooks/pre-commit.sh
# Ejecuta lint, type-check y prisma validate antes de un commit.
# Si falla, bloquea el commit con mensaje claro.
#
# Para usar como git hook:
#   cp .claude/hooks/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Ejecutando pre-commit checks..."

# 1. Prisma validate
echo "  → prisma validate"
npx prisma validate 2>/dev/null
if [ $? -ne 0 ]; then
  echo "❌ prisma validate falló. Revisa prisma/schema.prisma"
  exit 1
fi

# 2. TypeScript type-check
echo "  → tsc --noEmit"
npx tsc --noEmit 2>/dev/null
if [ $? -ne 0 ]; then
  echo "❌ TypeScript type-check falló. Corrige los errores de tipo."
  exit 1
fi

# 3. ESLint
echo "  → next lint"
npm run lint 2>/dev/null
if [ $? -ne 0 ]; then
  echo "❌ ESLint falló. Corrige los errores de lint."
  exit 1
fi

echo "✅ Pre-commit checks pasaron."
