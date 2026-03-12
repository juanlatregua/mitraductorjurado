#!/bin/bash
# .claude/hooks/protect.sh
# Advierte antes de modificar archivos protegidos.
# Archivos/carpetas que requieren confirmación explícita.
#
# Para activar como hook de Claude Code, añadir a .claude/settings.json:
# {
#   "hooks": {
#     "PreToolUse": [
#       { "matcher": "Edit|Write", "command": ".claude/hooks/protect.sh $FILE_PATH" }
#     ]
#   }
# }

FILE="$1"

if [ -z "$FILE" ]; then
  exit 0
fi

PROTECTED=false
REASON=""

case "$FILE" in
  */api/auth/*)
    PROTECTED=true
    REASON="Sistema de autenticación. Un error aquí bloquea el acceso de todos los usuarios."
    ;;
  */api/payments/*|*/api/webhooks/*)
    PROTECTED=true
    REASON="Sistema de pagos. Afecta dinero real y facturación legal."
    ;;
  */prisma/migrations/*)
    PROTECTED=true
    REASON="Migraciones de base de datos. Editar migraciones aplicadas puede corromper datos."
    ;;
  */prisma/schema.prisma)
    PROTECTED=true
    REASON="Schema de base de datos. Leer prisma/CLAUDE.md antes de modificar."
    ;;
  */middleware.ts)
    PROTECTED=true
    REASON="Middleware de autenticación. Afecta el acceso a toda la aplicación."
    ;;
  */lib/auth.ts)
    PROTECTED=true
    REASON="Configuración NextAuth. Afecta todos los tokens JWT activos."
    ;;
esac

if [ "$PROTECTED" = true ]; then
  echo "⚠️  ARCHIVO PROTEGIDO: $FILE"
  echo "    Motivo: $REASON"
  echo ""
  echo "    Asegúrate de entender el impacto antes de modificar."
  # No bloquea (exit 0), solo advierte. Cambiar a exit 1 para bloquear.
fi

exit 0
