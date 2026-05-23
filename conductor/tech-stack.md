# Technology Stack

## Application Framework

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Desktop Framework** | Electron (latest stable) | Cross-platform native desktop app (Windows, macOS, Linux) |
| **Build Tool** | electron-vite | Purpose-built Vite integration for Electron — handles main process TS compilation, renderer HMR, and preload bundling |
| **Package Manager** | pnpm v10+ | Fast, disk-efficient dependency management |

## Frontend (Renderer Process)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **UI Framework** | React 19 with TypeScript strict mode | Component-based UI |
| **Routing** | React Router v7 | Client-side navigation (no SSR) |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Chat UI** | @ai-sdk/react (useChat hook) | Streaming conversation interface via IPC-bridged data channel |

## Backend (Main Process)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js (Electron's built-in) | Main process backend |
| **LLM Integration** | Vercel AI SDK Core (ai v6) | `streamText` for streaming chat, `generateObject` for structured extraction |
| **LLM Adapter** | @ai-sdk/openai v3 | OpenAI-compatible provider support (OpenAI, LiteLLM, Ollama, Azure, etc.) |

## Data Layer

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Relational Database** | better-sqlite3 | Synchronous, embedded SQLite in main process |
| **Vector Engine** | sqlite-vec | SQLite extension for vector similarity search (cosine distance) |
| **Embeddings** | @xenova/transformers | Local ONNX-based embedding generation (all-MiniLM-L6-v2, 384-dim) |

## PDF Export

| Category | Technology | Purpose |
|----------|-----------|---------|
| **PDF Engine** | BrowserWindow.webContents.printToPDF() | Electron's built-in Chromium renders template HTML to pixel-perfect PDF |

## Testing & Quality

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Unit/Integration Tests** | Vitest + @vitest/coverage-v8 | Fast, Vite-native test runner with coverage |
| **E2E Tests** | @playwright/test (Electron launcher) | Full app testing via Electron's Chromium |
| **Linting** | ESLint | Code quality enforcement |
| **Formatting** | Prettier | Consistent code formatting |
| **Git Hooks** | Husky + lint-staged | Pre-commit and pre-push gates |

## Packaging & Distribution

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Packaging** | electron-builder | Cross-platform installer generation |
| **Windows** | NSIS installer | .exe installer |
| **macOS** | .dmg | macOS disk image |
| **Linux** | AppImage | Linux portable app |

## Security

| Aspect | Implementation |
|--------|---------------|
| **Context Isolation** | Enabled |
| **Node Integration** | Disabled (nodeIntegration: false) |
| **Sandbox** | Enabled (sandbox: true) |
| **Preload Bridge** | contextBridge.exposeInMainWorld with typed electronAPI |
| **CSP** | Strict Content Security Policy header |
| **API Key Encryption** | AES-256-GCM via Node crypto, key derived from machine-local secret file |
| **Network** | TLS 1.3 for all outbound LLM requests |
