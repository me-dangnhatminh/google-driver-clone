# Project Overview

This repository contains multiple services and applications that together form a comprehensive system. Below is an overview of the project structure and instructions for setting up and running the services.

## Project Structure

### Directory Descriptions

- **apps/**: Contains the main applications and services.
  - **api-gateway/**: Configuration for different API Gateway solutions (Kong, Traefik, Tyk).
  - **auth-service/**: Handles authentication and authorization, built with NestJS.
  - **client-ui/**: The frontend application.
  - **deploy/**: Deployment configurations and scripts.
  - **monitoring-service/**: Monitors the health and performance of the system.
  - **payment-service/**: Manages payment processing.
  - **storage-service/**: Manages data storage.

- **protos/**: Contains protobuf definitions for the services.

- **docker-compose.yml**: Docker Compose configuration file for orchestrating multi-container Docker applications.

- **README.md**: Main documentation file for the project.

This structure helps in maintaining a clear separation of concerns, making the project easier to navigate and manage.

## Services

### API Gateway

The API Gateway is responsible for routing requests to the appropriate services. It supports multiple configurations including Kong, Traefik, and Tyk.

- **Configuration Files**: `.env`, `.gitignore`
- **Subdirectories**: `kong/`, `traefik/`, `tyk/`

### Auth Service

The Auth Service handles authentication and authorization. It is built using NestJS.

- **Configuration Files**: `.env`, `.eslintrc.js`, `.gitignore`, `.prettierrc`, `nest-cli.json`, `tsconfig.build.json`, `tsconfig.json`, `webpack-hmr.config.js`
- **Directories**: `libs/`, `logs/`, `src/`, `test/`
- **Package Management**: `package.json`, `pnpm-lock.yaml`
- **Documentation**: `README.md`

### Client UI

The Client UI is the frontend application.

- **Configuration Files**: `.dockerignore`, `.env`, `.eslintrc.cjs`, `...`

### Monitoring Service

The Monitoring Service is responsible for monitoring the health and performance of the system.

### Payment Service

The Payment Service handles payment processing.

### Storage Service

The Storage Service manages data storage.

## Protobuf Definitions

The `protos` directory contains the protobuf definitions for the services.

- **Files**: `auth.proto`, `payment.proto`, `storage_v2.proto`, `storage.proto`

## Setup

### Prerequisites

- Node.js
- pnpm (for package management)
- Docker (for containerized services)

### Installation

1. Clone the repository:

    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies for each service:

    ```sh
    cd apps/auth-service
    pnpm install
    ```

3. Repeat the above step for other services as needed.

### Running the Services

1. Start the services using Docker Compose:

    ```sh
    docker-compose up
    ```

2. For development, you can start individual services using:

    ```sh
    cd apps/auth-service
    pnpm start:dev
    ```

3. Repeat the above step for other services as needed.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License.
