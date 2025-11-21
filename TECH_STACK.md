# Tech Stack

## RAG Chatbot - Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3 (Custom styling with modern design patterns)
- **HTTP Client**: Fetch API
- **Deployment**: Nginx (Docker container)

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **Architecture**: Modular MVC pattern
  - Controllers
  - Services
  - Routes
  - Utils
  - Config

### AI & Machine Learning
- **LLM**: Google Gemini 2.5 Flash
- **Vector Database**: Qdrant
- **Embeddings**: Jina AI Embeddings API
- **RAG Pattern**: Retrieval-Augmented Generation

### Data Storage
- **Session Store**: Redis
- **Vector Store**: Qdrant
- **Cache**: Redis

### DevOps & Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx
- **Cloud Platform**: AWS EC2 (Amazon Linux 2023)
- **CI/CD**: Manual deployment via SSH

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Editor**: VS Code (recommended)

### Key Libraries & Dependencies

#### Backend
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `redis` - Redis client
- `@qdrant/js-client-rest` - Qdrant vector database client
- `@google/generative-ai` - Google Gemini API client
- `dotenv` - Environment variable management

#### Frontend
- `react` - UI library
- `react-dom` - React DOM rendering

### Architecture Patterns
- **Backend**: RESTful API with modular service layer
- **Frontend**: Component-based architecture
- **Data Flow**: RAG (Retrieval-Augmented Generation)
- **Session Management**: Redis-backed session store
- **Containerization**: Multi-container Docker setup with service discovery

### Network & Ports
- **Frontend**: Port 8080 (Nginx)
- **Backend**: Port 3000 (Express)
- **Redis**: Port 6379 (Internal)
- **Qdrant**: Port 6333 (Internal)

### Security
- **CORS**: Configured for production
- **Environment Variables**: Sensitive data stored in `.env`
- **API Keys**: Gemini AI, Jina AI
- **Network**: AWS Security Groups for firewall rules
