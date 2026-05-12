# TableBit - Configuración de Agentes OpenCode

## Estructura

```
opencode-config/
├── CLAUDE.md              # Este archivo - contexto principal
├── opencode.json          # Configuración principal de OpenCode
├── agents/                # Agentes especializados
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   ├── fullstack-developer.md
│   ├── security-auditor.md
│   └── devops-engineer.md
├── commands/               # Comandos personalizados
│   ├── deploy.sh
│   ├── test-backend.sh
│   ├── test-frontend.sh
│   └── migrate.sh
├── rules/                  # Reglas de código
│   ├── laravel-rules.md
│   ├── react-rules.md
│   └── security-rules.md
└── scripts/                # Scripts auxiliares
    ├── generate-migration.sh
    ├── create-component.sh
    └── seed-database.sh
```

## Uso

Los agentes y comandos se referencian desde `opencode.json` y se cargan según el contexto del proyecto.
