# Burnout Tracker - Student Wellbeing System

A proactive student wellbeing system for universities that detects early burnout signs via daily check-ins, provides real-time interventions, and gives universities anonymized analytics.

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.4.x, Spring Security 6, Spring Data JPA
- **Database**: PostgreSQL 15
- **Auth**: JWT, BCrypt
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Cache**: Redis
- **Messaging**: RabbitMQ
- **Containerization**: Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17 (for local backend development)
- Node.js 20+ (for local frontend development)

### 1. Clone and Setup

```bash
cd burnout-tracker
```

### 2. Configure Environment Variables

**Backend** (`burnout-backend/.env`):
```env
DB_URL=jdbc:postgresql://postgres:5432/burnout_db
DB_USERNAME=burnout_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_256_bit_secret_key_here_minimum_32_characters_long
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGIN=http://localhost:3000
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
```

**Frontend** (`burnout-frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### 4. Test Accounts

Pre-seeded accounts (created automatically on first startup):

**Admin**:
- Email: `admin@university.edu`
- Password: `AdminPass123!`

**Counselor**:
- Email: `counselor@university.edu`
- Password: `CounselorPass123!`

**Student**: Register a new account at http://localhost:3000/register

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new student | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/consent` | Update consent preferences | Yes |

### Mood Tracking

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/mood` | Create mood entry | Yes |
| GET | `/api/mood` | Get user's mood history | Yes |

### Burnout Scores

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/burnout/latest` | Get latest burnout score | Yes |
| GET | `/api/burnout/history` | Get burnout score history | Yes |

### Admin (ADMIN/COUNSELOR only)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/analytics` | Campus-wide anonymized analytics | Yes |
| GET | `/api/admin/high-risk` | High-risk alerts (anonymized) | Yes |

## Security Features

- JWT-based authentication with 24-hour expiry (8 hours for admins)
- BCrypt password hashing (strength 12)
- Role-based access control (STUDENT, ADMIN, COUNSELOR)
- CORS restricted to frontend origin
- Student data anonymization for admin views
- Consent-based data sharing

## Consent System

- Students MUST be presented with consent screen on first login
- Consent is OPTIONAL - students can use all features without contributing to analytics
- `anonymize_data=true` excludes student from ALL admin/counselor queries
- Consent can be updated anytime in profile settings

## Development

### Backend (Local)

```bash
cd burnout-backend
mvn spring-boot:run
```

### Frontend (Local)

```bash
cd burnout-frontend
npm install
npm run dev
```

## Project Structure

```
burnout-tracker/
├── burnout-backend/          # Spring Boot backend
│   ├── src/main/java/com/burnouttracker/
│   │   ├── config/           # Security, JWT, CORS config
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access layer
│   │   ├── model/            # JPA entities
│   │   ├── dto/              # Request/Response DTOs
│   │   └── security/         # JWT auth components
│   └── src/main/resources/
│       └── db/migration/     # Flyway migrations
├── burnout-frontend/         # Next.js frontend
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/       # React components
│       ├── services/         # API clients
│       ├── context/          # React context
│       └── hooks/            # Custom hooks
└── docker-compose.yml        # Docker orchestration
```

## License

MIT License
