# AI Knowledge Assistant - Backend

A NestJS-based AI assistant with **RAG (Retrieval-Augmented Generation)**, **web search**, and **domain-specific APIs** for intelligent multi-source question answering.

## 🎯 Features

- ✅ **RAG Document Search** - Upload PDFs and search them with semantic vector search
- ✅ **Web Search** - DuckDuckGo integration for current information
- ✅ **Agent Orchestration** - AI-driven tool selection using LangChain
- ✅ **PostgreSQL + pgvector** - Persistent vector storage
- ✅ **JWT Authentication** - Secure user management
- ✅ **Multi-Tool Integration** - Extensible tool architecture

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required variables:
- `GROQ_API_KEY` - Groq LLM API key
- `GEMINI_API_KEY` - Google Gemini for embeddings
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens

Optional (with defaults):
- `RAG_SIMILARITY_THRESHOLD` - Vector search similarity threshold (default: 0.7)

### 3. Setup Database

```bash
# Enable pgvector extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
npm run db:push
```

### 4. Start Server

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`

### 5. Test the System

```bash
# Get JWT token
curl -X POST http://localhost:3000/v1/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Upload a document
curl -X POST http://localhost:3000/v1/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"

# Ask the agent a question
curl -X POST http://localhost:3000/v1/api/agent/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"What is in my documents?"}'
```

## 📚 Documentation

### Start Here

1. **[COMPLETE_SYSTEM_FLOW.md](COMPLETE_SYSTEM_FLOW.md)** ⭐ **RECOMMENDED**
   - Complete request-to-response flows
   - All entry points documented
   - Comprehensive testing guide
   - Shows what happens at each step

2. **[QUICK_START.md](QUICK_START.md)**
   - Fast 5-step setup guide
   - Basic testing examples
   - Troubleshooting tips

3. **[CLEANUP_AND_DOCUMENTATION_SUMMARY.md](CLEANUP_AND_DOCUMENTATION_SUMMARY.md)**
   - Overview of all documentation
   - File structure
   - What each document covers

### Understanding the System

4. **[ANSWER_TO_YOUR_QUESTION.md](ANSWER_TO_YOUR_QUESTION.md)**
   - How RAG and web search work together
   - Data fetching priority explanation
   - Practical examples

5. **[RAG_AGENT_INTEGRATION.md](RAG_AGENT_INTEGRATION.md)**
   - How RAG integrates with the agent
   - Architecture details
   - Configuration options

6. **[DATA_FETCHING_FLOW.md](DATA_FETCHING_FLOW.md)**
   - Data fetching behavior
   - Tool decision process
   - Customization guide

### RAG & Documents

7. **[RAG_DOCUMENT_GUIDE.md](RAG_DOCUMENT_GUIDE.md)**
   - Document upload guide
   - RAG setup instructions
   - Database configuration

8. **[RAG_IMPLEMENTATION_SUMMARY.md](RAG_IMPLEMENTATION_SUMMARY.md)**
   - RAG implementation overview
   - Features and capabilities

### API Reference

9. **[QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)**
   - All API endpoints
   - Request/response formats
   - Authentication requirements

10. **[API_PREFIX_NOTE.md](API_PREFIX_NOTE.md)**
    - API versioning strategy
    - URL structure

### Implementation Details

11. **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)**
    - What was implemented
    - Architecture overview
    - Testing instructions

12. **[IMPLEMENTATION_REVIEW.md](IMPLEMENTATION_REVIEW.md)**
    - Code review notes
    - Best practices

## 🧪 Testing

### Automated Tests

```bash
# Test agent with RAG + web search
./test-agent-with-rag.sh

# Test document upload and RAG
./test-documents.sh
```

### Manual Testing

See **[COMPLETE_SYSTEM_FLOW.md - Section 5: Testing Guide](COMPLETE_SYSTEM_FLOW.md)** for:
- 7 detailed test scenarios
- Exact cURL commands
- Expected responses
- What to watch in server logs

## 🏗️ Architecture

### System Overview

```
User Request
    ↓
/v1/api/*
    ↓
┌───────────┬─────────────┬────────────┐
↓           ↓             ↓            ↓
Agent    Documents      Auth        User
(Public)  (Protected)  (Public)   (Protected)
    ↓           ↓
┌───────────────────────────────────┐
│        LangChain Agent            │
│  (Intelligent Tool Selection)     │
└───────┬───────────────────────────┘
        ↓
┌───────┼─────────┬──────────┐
↓       ↓         ↓          ↓
RAG   Web     Domain       (Future
Docs  Search   APIs        Tools...)
```

### Key Components

- **Agent Module** - Multi-source Q&A orchestration
- **Document Module** - PDF upload and RAG search
- **Auth Module** - JWT-based authentication
- **Database** - PostgreSQL with pgvector extension

## 📊 API Endpoints

### Agent API (Public)
- `POST /v1/api/agent/ask` - Ask questions (uses RAG + web + APIs)

### Document API (Protected)
- `POST /v1/api/documents/upload` - Upload PDF
- `GET /v1/api/documents` - List documents
- `GET /v1/api/documents/:id` - Get document
- `DELETE /v1/api/documents/:id` - Delete document
- `POST /v1/api/documents/query` - Search documents

### Auth API (Public)
- `POST /v1/api/auth/register` - Register user
- `POST /v1/api/auth/login` - Login (get JWT)

### User API (Protected)
- `GET /v1/api/users/profile` - Get user profile

## 🛠️ Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with pgvector
- **ORM:** Drizzle ORM
- **LLM:** Groq (llama-3.3-70b-versatile)
- **Embeddings:** Google Gemini (text-embedding-004)
- **Agent:** LangChain
- **Web Search:** DuckDuckGo
- **Authentication:** JWT (Passport)
- **File Processing:** LangChain PDFLoader

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
│
├── agent/                     # Agent module (Multi-source Q&A)
│   ├── agent.controller.ts
│   ├── agent.service.ts
│   └── providers/
│       ├── agent-executor.provider.ts
│       └── tool.provider.ts
│
├── document/                  # RAG module
│   ├── document.controller.ts
│   ├── document.service.ts
│   └── application/
│       ├── pdf-loader.service.ts
│       ├── vector-store.service.ts
│       └── document-retriever-tool.service.ts
│
├── auth/                      # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── jwt.guard.ts
│
├── db/                        # Database
│   ├── schema.ts
│   └── drizzle.module.ts
│
└── application/               # Shared utilities
    └── embeddings/
        └── create-embedding-model.ts
```

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Authentication
JWT_SECRET=your-secret-key

# AI Services
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=your_gemini_key

# Optional
GROQ_MODEL=llama-3.3-70b-versatile
DUCK_DUCK_GO_MAX_RESULTS=3

# RAG Configuration
# Similarity threshold for vector search (0-2 scale, lower = stricter matching)
# Default: 0.7 - filters out irrelevant results
# Lower (e.g., 0.5) = only very similar results
# Higher (e.g., 0.9) = more lenient, includes less similar results
RAG_SIMILARITY_THRESHOLD=0.7
```

### Database Schema

- **users** - User accounts
- **documents** - Document metadata
- **document_chunks** - Text chunks with vector embeddings

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Issues

```bash
# Check pgvector is installed
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"

# Reinstall if needed
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Agent Not Using RAG

Check server logs for:
```
Agent initialized with tools: [..., search-uploaded-documents]
```

If missing, verify:
1. DocumentModule exports DocumentRetrieverToolService
2. KnowledgeBaseModule imports DocumentModule
3. Server restarted after code changes

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [LangChain Documentation](https://js.langchain.com/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Groq Documentation](https://console.groq.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎉 Getting Help

- **Complete System Flow:** See [COMPLETE_SYSTEM_FLOW.md](COMPLETE_SYSTEM_FLOW.md)
- **Quick Start:** See [QUICK_START.md](QUICK_START.md)
- **Testing Guide:** See [COMPLETE_SYSTEM_FLOW.md - Testing Guide](COMPLETE_SYSTEM_FLOW.md)
- **API Reference:** See [QUICK_API_REFERENCE.md](QUICK_API_REFERENCE.md)

---

**Built with ❤️ using NestJS, LangChain, and pgvector**
