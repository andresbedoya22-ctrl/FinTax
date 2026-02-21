# fintax-web

## Requisitos

- Node.js 20+
- pnpm

## Ejecutar en desarrollo

```bash
pnpm dev
```

## Ejecutar lint

```bash
pnpm lint
```

## Ejecutar build

```bash
pnpm build
```

## Ejecutar typecheck

```bash
pnpm typecheck
```

## Ejecutar test

```bash
pnpm test
```

Nota: actualmente `pnpm test` es un placeholder y termina en exito hasta agregar tests reales.

## Estrategia de ramas

- Rama estable: `main`
- Trabajo de features: `feature/*`
- Abrir Pull Request de `feature/*` hacia `main`

## Convencion de commits

- Usar Conventional Commits
- Formato: `<type>(scope opcional): descripcion`
- Tipos recomendados: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`
