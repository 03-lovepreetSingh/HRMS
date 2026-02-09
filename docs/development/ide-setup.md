# IDE Setup

Recommended IDE configuration for AI-HRMS development.

## Visual Studio Code

### Extensions

Install these extensions:

| Extension | Purpose |
|-----------|---------|
| ESLint | Linting |
| Prettier | Code formatting |
| TypeScript Importer | Auto imports |
| Tailwind CSS IntelliSense | Tailwind autocomplete |
| Thunder Client | API testing |
| Docker | Container management |
| GitLens | Git enhancements |

### Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/pnpm-lock.yaml": true
  }
}
```

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "@ai-hrms/api", "dev"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Web",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "@ai-hrms/web", "dev"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

## WebStorm / IntelliJ IDEA

### Recommended Plugins

- Tailwind CSS
- Prettier
- .env files support

### Configuration

1. **Enable TypeScript**:
   - Preferences → Languages & Frameworks → TypeScript
   - Set Node interpreter
   - Enable "Recompile on changes"

2. **Configure ESLint**:
   - Preferences → Languages & Frameworks → Code Quality Tools → ESLint
   - Enable "Automatic ESLint configuration"

3. **Set up Prettier**:
   - Preferences → Languages & Frameworks → JavaScript → Prettier
   - Enable "On save" and "On reformat"

## Vim / Neovim

### Plugins

```vim
" TypeScript
Plug 'leafgarland/typescript-vim'
Plug 'peitalin/vim-jsx-typescript'

" LSP
Plug 'neoclide/coc.nvim', {'branch': 'release'}

" Formatting
Plug 'prettier/vim-prettier'

" File explorer
Plug 'preservim/nerdtree'
```

### CoC Configuration

```json
{
  "coc.preferences.formatOnSaveFiletypes": [
    "typescript",
    "typescriptreact",
    "javascript",
    "javascriptreact"
  ],
  "tsserver.enable": true,
  "eslint.enable": true,
  "prettier.enable": true
}
```

## Cursor

Cursor works out of the box with the VS Code settings above. Additional tips:

1. Use Cmd+K for AI-assisted coding
2. Use Cmd+L for chat-based assistance
3. Index the entire codebase for better context

## Debugging

### API Debugging

1. Set breakpoints in VS Code
2. Run "Debug API" configuration
3. Use Thunder Client/Postman to hit endpoints

### Frontend Debugging

1. Start web dev server: `pnpm dev`
2. Open Chrome DevTools
3. Or use VS Code debugger with Chrome extension

### Database Debugging

Use Drizzle Studio:
```bash
pnpm db:studio
```

Or connect with your favorite DB tool:
- TablePlus
- DBeaver
- DataGrip

Connection: `postgresql://hrms_user:hrms_password@localhost:5432/ai_hrms`

## Terminal Setup

### Windows (PowerShell)

```powershell
# Add to $PROFILE
function hrms-dev { pnpm dev }
function hrms-build { pnpm build }
function hrms-test { pnpm test }
function hrms-db { pnpm db:studio }
```

### macOS/Linux (bash/zsh)

```bash
# Add to .bashrc or .zshrc
alias hrms-dev='pnpm dev'
alias hrms-build='pnpm build'
alias hrms-test='pnpm test'
alias hrms-db='pnpm db:studio'
alias hrms-lint='pnpm lint'
```

## Git Configuration

### Useful Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate"
```

### Git Hooks

The project may include git hooks. If not working:

```bash
# Reinstall hooks
npx husky install
```
