# WebSocketNotifier

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://github.com/yourusername/WebSocketNotifier/actions/workflows/nodejs.yml/badge.svg)](https://github.com/yourusername/WebSocketNotifier)

A production‑ready **WebSocket notification system** built with modern JavaScript (ES Modules). 
It provides:

- Centralised configuration handling (`config/default.json` + `.env`)
- Structured logging via **winston**
- A robust WebSocket server that manages client connections and broadcasting
- A `NotificationService` API for sending real‑time notifications
- Comprehensive unit tests with **Jest**
- An optional HTTP health‑check endpoint (Express)

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Overview](#api-overview)
- [Testing](#testing)
- [License](#license)

## Installation