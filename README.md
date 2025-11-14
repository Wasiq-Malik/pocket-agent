# PocketAgent

AI-Powered Pokemon Ruby Agent running 100% in the browser.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** TailwindCSS
- **Emulator:** @thenick775/mgba-wasm (GBA)
- **AI:** WebLLM (DeepSeek-R1-Distill-Llama-8B)
- **Deployment:** Vercel

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## MVP Features (In Progress)

- [x] Project setup with Vite + React + TypeScript
- [x] WebGPU detection and browser compatibility check
- [ ] GBA Emulator integration
- [ ] WebLLM AI agent
- [ ] Pokemon Ruby mapper
- [ ] Autonomous gameplay loop
- [ ] Real-time observability panel

## Browser Requirements

- Chrome 113+ (WebGPU support required)
- 12GB+ GPU recommended for optimal AI performance

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. The `vercel.json` configuration includes necessary headers for WebGPU and WASM
3. Deploy with default settings - Vite builds are automatically detected

Or use the Vercel CLI:
```bash
npm install -g vercel
vercel
```
