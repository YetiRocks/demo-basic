<p align="center">
  <img src="https://cdn.prod.website-files.com/68e09cef90d613c94c3671c0/697e805a9246c7e090054706_logo_horizontal_grey.png" alt="Yeti" width="200" />
</p>

---

# demo-basic

[![Yeti](https://img.shields.io/badge/Yeti-Application-blue)](https://yetirocks.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **[Yeti](https://yetirocks.com)** — The Performance Platform for Agent-Driven Development.
> Schema-driven APIs, real-time streaming, and vector search. From prompt to production.

Counter with persistent state and a custom Rust greeting endpoint. Shows how schema-defined tables and custom Rust resources work together in a single application.

## Features

- Persistent counter via REST `PUT` / `GET`
- Custom `/greeting` Rust resource
- Schema-driven table creation

## Installation

```bash
cd ~/yeti/applications
git clone https://github.com/yetirocks/demo-basic.git
cd demo-basic/source
npm install
npm run build
```

## Project Structure

```
demo-basic/
├── config.yaml              # App configuration
├── schemas/
│   ├── basic.graphql        # Counter table (TableName)
│   └── schema.graphql       # BetaSignup table
├── resources/
│   └── greeting.rs          # Custom Rust greeting endpoint
└── source/                  # React/Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
```

## Configuration

```yaml
name: "Basic Demo"
app_id: "demo-basic"
version: "1.0.0"
description: "Simple counter with persistent state and a custom Rust greeting endpoint"
enabled: true
rest: true
graphql: true

schemas:
  - schemas/basic.graphql
  - schemas/schema.graphql

resources:
  - resources/*.rs

static_files:
  path: web
  route: /
  index: index.html
  notFound:
    file: index.html
    statusCode: 200
  build:
    sourceDir: source
    command: npm run build
```

## Schemas

**basic.graphql** -- Counter table:
```graphql
type TableName @table(database: "demo-basic") @export {
    id: ID! @primaryKey
    count: Int!
}
```

**schema.graphql** -- Beta signup:
```graphql
type BetaSignup @table(database: "demo-basic") @export {
    id: ID! @primaryKey
    name: String!
    email: String!
    company: String
    title: String
    idea: String
    created_at: String! @createdTime
}
```

## Development

```bash
cd source

# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Build for production
npm run build
```

---

Built with [Yeti](https://yetirocks.com) | The Performance Platform for Agent-Driven Development
