# Create and Manage Standards

## Overview

**Create and Manage Standards** is a Node.js and Express-based web application that allows users to draft, submit, and manage standards. The application relies on a PostgreSQL database for session management and connects to a Strapi instance as the CMS backend.

## Features

- Node.js and Express framework.
- PostgreSQL database for session management.
- Integration with Strapi CMS for content management.
- Configurable environment variables for different deployment stages.
- Session caching with configurable timeouts.
- User-friendly interface with the service name **'Create and Manage Standards'**.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [PostgreSQL](https://www.postgresql.org/) (for session management)
- [Strapi CMS](https://strapi.io/) instance

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/DFE-Digital/manage-standards.git
cd manage-standards
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and configure the necessary environment variables as shown below:

```env
# Application Port
PORT=3085

# Service URL
serviceURL=http://localhost:3085

# Strapi CMS Configuration
STRAPI_API_URL=http://localhost:1338
STRAPI_API_KEY=your_strapi_api_key
staging=true

# Cache Settings
CacheTimeout=30

# Service Name
serviceName='Create and manage standards'

# CMS Feature Toggle
cmsEnabled=true

# Session Key
SESSION_KEY=your_session_key

# Database Configuration
DATABASE_URL=your_database_url

# Domain Whitelist
domainWhiteList=@yourdomain.gov.uk

# GOV.UK Notify Keys
NOTIFY_KEY=your_notify_key

# Email Templates
MAGICLINK_TEMPLATE_ID=your_template_id
EMAIL_FORUM_REJECTED_TEMPLATE_ID=your_template_id
EMAIL_FORUM_APPROVED_TEMPLATE_ID=your_template_id
EMAIL_STANDARD_SUBMITTED_TO_FORUM=your_template_id
EMAIL_STANDARD_SUBMITTED=your_template_id
EMAIL_FORUM=someone@example.com

# Manual URL
manualURL=http://localhost:3084
```

> **Note:** The `STRAPI_API_URL` and `STRAPI_API_KEY` should be set appropriately for staging and production environments.

### 4. Run the Application

```sh
npm run dev
```

The application will be available at `http://localhost:3085`.

## Deployment

### Staging Configuration

```env
STRAPI_API_URL=/path
STRAPI_API_KEY=your_staging_api_key
staging=true
```

### Production Configuration

```env
STRAPI_API_URL=/path
STRAPI_API_KEY=your_production_api_key
staging=false
```

## Project Structure

```
.
├── app/               # Views and controllers
├── public/            # Static files
├── services/          # Middleware for API integrations
├── utils/             # Helpers for routing and sessions
├── .env               # Environment variables
├── app.js             # Main application logic
├── package.json       # Node dependencies
└── LICENSE.txt        # MIT license
└── README.md          # Project documentation
```

## Contributing

We welcome contributions! Please submit a pull request with your proposed changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any questions or issues, please contact the DfE DesignOps team at https://design.education.gov.uk
