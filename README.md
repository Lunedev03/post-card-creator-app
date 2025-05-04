# Post Card Creator App

Uma aplicação web para criar, personalizar e salvar cartões de postagens com emojis e assistência via IA.

## Tecnologias Utilizadas

- **Vite** ([Documentação](https://vitejs.dev/))
- **React** ([Documentação](https://reactjs.org/))
- **TypeScript** ([Documentação](https://www.typescriptlang.org/))
- **Tailwind CSS** ([Documentação](https://tailwindcss.com/))
- **shadcn-ui** ([Repositório](https://github.com/shadcn/shadcn-ui))
- **Radix UI** ([Documentação](https://www.radix-ui.com/))
- **React Query** ([Documentação](https://tanstack.com/query))
- **Zod** ([Documentação](https://zod.dev/))
- **OpenAI** ([Documentação](https://platform.openai.com/docs/))
- **html2canvas** ([Documentação](https://github.com/niklasvh/html2canvas))

## Funcionalidades

- Criação e visualização de previews de postagens.
- Seleção e inserção de emojis em tempo real.
- Assistente de IA para sugerir textos e melhorias.
- Interface arrastável (drag and drop) responsiva.
- Histórico de postagens e de conversas com a IA.
- Suporte a temas Claro/Escuro com detecção de preferência do sistema.

## Estrutura do Projeto

```
public/              # Arquivos estáticos e index.html
src/
  ├─ components/     # Componentes reutilizáveis (UI, layouts, post, emoji, chat)
  ├─ contexts/       # Contextos de estado global para histórico
  ├─ hooks/          # Hooks customizados
  ├─ pages/          # Páginas principais (Index, History, ChatHistory, NotFound)
  ├─ services/       # Integração com APIs (OpenAI, etc.)
  ├─ utils/          # Funções utilitárias
  ├─ App.tsx         # Componente raiz e roteamento
  └─ main.tsx        # Ponto de entrada da aplicação
```

## Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPO>
cd post-card-creator-app

# Instale as dependências
npm install
```

## Scripts Disponíveis

- `npm run dev`  
  Inicia o servidor de desenvolvimento (com hot-reload).
- `npm run build`  
  Gera os arquivos de produção em `dist/`.
- `npm run preview`  
  Serve a versão de produção localmente.
- `npm run lint`  
  Executa o ESLint para analisar o código.

## Uso

1. Execute `npm run dev`.
2. Abra `http://localhost:5173` no navegador.
3. Crie e personalize seu post com emojis ou use o assistente de IA.
4. Arraste e redimensione componentes conforme desejar.
5. Acesse o menu `Histórico` para visualizar posts e conversas salvos.

## Deploy

Este projeto pode ser implantado em qualquer serviço estático (Vercel, Netlify, GitHub Pages). Basta apontar para a pasta `dist/` após o build.

## Contribuição

1. Fork e clone este repositório.
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`.
3. Faça commit das suas alterações seguindo Conventional Commits.
4. Abra um Pull Request descrevendo as mudanças.

## Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
