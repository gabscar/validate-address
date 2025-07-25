# 🏠 Address Validator API

An Express + TypeScript-based API for validating and standardizing US property addresses. The architecture follows **Clean Architecture** principles.

---

## 🌟 Features

* Free-form address input
* Structured address output
* U.S. address support only
* **Hybrid parsing engine**: fast Regex for simple addresses, fallback to Groq AI for complex cases
* Returns status: valid, corrected, or fail
* Swagger documentation
---
## 🧩 Parsing Approach
This project uses a hybrid parsing strategy to handle a wide variety of address formats:

* Regex-Based Extraction: First, it attempts to parse the address using custom-crafted regular expressions for speed and accuracy on well-formatted inputs.

* Grok AI Fallback: If regex parsing fails or results are incomplete, the system falls back to Grok AI to interpret and structure the address, especially useful for handling messy inputs, abbreviations, or uncommon patterns.

This layered approach increases resilience and ensures more accurate results across diverse real-world address inputs.
---

## 🧠 AI Usage

This project uses AI to accelerate development and improve functionality:

* Assisted in building the **regex rules** for parsing and validation.
* Helped with **Groq API integration**, including prompt design and response parsing.
* Used to generate **edge case address examples** for testing.
* Assisted in writing parts of the **documentation and error handling strategy**.

---

## 🏗️ Architecture

The project is organized using Clean Architecture principles:

```
src/
├── domain/                    # Business logic & core entities
│   ├── entities/             # Domain models (Address, etc.)
│   └── services/             # Service interfaces
├── usecase/                  # Application use cases
├── infra/                    # External implementations
│   └── services/             # Regex + Groq-based address parsers
└── interface/                # External interfaces
    ├── controllers/          # HTTP controllers
    ├── http/                 # Express server setup
    └── validators/           # Input validation with Zod
```

---

## 🔄 Validation Strategy

The API uses a smart fallback validation strategy:

1. **Regex Parser**: Attempts to extract structured data from simple, well-formed inputs.
2. **Groq AI Parser**: Used when regex fails — handles complex patterns, abbreviations, apartments, etc.
3. **Final Fallback**: If both fail, the address is returned as unverifiable.

---

## 🚀 Getting Started

### Requirements

* Node.js 18+
* npm

### Installation

1. Clone the repo:

```bash
git clone <repository-url>
cd address-validator
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env to add your GROQ_API_KEY if using Groq AI
```

4. Run in development mode:

```bash
npm run dev
```

5. Build and start for production with docker:

```bash
# Build and start the production service
docker-compose up -d

# View logs
docker-compose logs -f address-validator-api

# Stop the service
docker-compose down
```

---

## 📚 API Documentation

* **Base URL**: `http://localhost:3000`
* **Swagger UI**: `http://localhost:3000/api-docs`
* **Health Check**: `http://localhost:3000/health`

### POST `/validate-address`

Validates and standardizes a free-form U.S. address.

#### 🔸 Request body:

```json
{
  "address": "123 Main St, New York, NY 10001"
}
```

#### 🔹 Successful response:

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "isCorrected": false,
    "isUnverifiable": false,
    "originalAddress": "123 Main St, New York, NY 10001",
    "validatedAddress": {
      "street": "Main St",
      "number": "123",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "confidence": 100,
    "validationMethod": "regex"
  }
}
```

#### 🔹 Example with complex input:

```json
{
  "address": "apt 5b, 123 n. main st, new york ny 10001"
}
```

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "isCorrected": true,
    "originalAddress": "apt 5b, 123 n. main st, new york ny 10001",
    "validatedAddress": {
      "street": "North Main Street",
      "number": "123",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "corrections": [
      "Expanded 'St.' to 'Street'",
      "Expanded 'N.' to 'North'",
      "Standardized apartment number 'apt5b' to '5B'"
    ],
    "confidence": 90,
    "validationMethod": "grok"
  }
}
```

---

## 🧲 Testing

Run all tests:

```bash
npm test
```

Run in watch mode:

```bash
npm run test:watch
```

---

## 🛠️ Tech Stack

* **Node.js** – JavaScript runtime
* **Express** – Web server framework
* **TypeScript** – Strong typing for better reliability
* **Jest** – Unit testing framework
* **Swagger** – API documentation
* **Zod** – Input schema validation
* **Axios** – HTTP client

---

## 🧑‍💻 Dev Scripts

| Script             | Description                             |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Run in development mode with hot reload |
| `npm run build`    | Build the TypeScript project            |
| `npm start`        | Run the compiled code                   |
| `npm test`         | Run tests                               |
| `npm run lint`     | Run lint                                |
| `npm run lint:fix` | Auto-fix lint errors                    |
