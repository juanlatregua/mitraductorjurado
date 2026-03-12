#!/bin/bash
# .claude/hooks/post-edit.sh
# Ejecuta prettier después de cualquier edición de archivo.
# Requiere: npm install -D prettier (TODO: añadir a devDependencies)
#
# Para activar como hook de Claude Code, añadir a .claude/settings.json:
# {
#   "hooks": {
#     "PostToolUse": [
#       { "matcher": "Edit|Write", "command": ".claude/hooks/post-edit.sh $FILE_PATH" }
#     ]
#   }
# }

FILE="$1"

if [ -z "$FILE" ]; then
  exit 0
fi

# Solo formatear archivos de código
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    if command -v npx &> /dev/null; then
      npx prettier --write "$FILE" 2>/dev/null
    fi
    ;;
esac
