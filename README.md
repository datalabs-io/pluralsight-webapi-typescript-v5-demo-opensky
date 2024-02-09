# Opensky-api Documentation

This documentation provides an overview of an Express.js server implemented in the provided JavaScript file. The server serves as a basic application for handling WebSocket connections and providing RESTful APIs for accessing data stored in JSON files.

## Table of Contents
1. [Introduction](#1-introduction)
2. [Dependencies](#2-dependencies)
3. [Server Setup](#3-server-setup)
4. [WebSocket Communication](#4-websocket-communication)
5. [RESTful APIs](#5-restful-apis)
6. [Running the Server](#6-running-the-server)

## 1. Introduction
This Express.js server is designed to handle WebSocket connections and serve JSON data from files to clients. It utilizes the following key dependencies: `express`, `http`, `fs`, `ws` (WebSocket library), `cors`, and `path`.

## 2. Dependencies
- `express`: A web application framework for creating web servers.
- `http`: A built-in module in Node.js for creating HTTP servers.
- `fs`: A built-in module in Node.js for file system operations.
- `ws` (WebSocket): A library for WebSocket support.
- `cors`: Middleware for enabling Cross-Origin Resource Sharing.
- `path`: A built-in module for working with file paths.

## 3. Server Setup
- The server is set up to listen on port 4000.
- CORS is enabled to allow cross-origin requests.
- A WebSocket server is created for real-time data communication.

## 4. WebSocket Communication
- The server establishes WebSocket communication using the `ws` library.
- The server periodically broadcasts JSON data to connected WebSocket clients.
- JSON data is read from files in the "uploads" directory, and clients receive this data in real-time.
- When a client connects, disconnects, or sends a message, corresponding events are logged.

## 5. RESTful APIs
The server provides two RESTful APIs:

### `/opensky-local`
- **Method:** GET
- **Query Parameters:**
  - `fileId` (required): The identifier for the JSON file to retrieve.
- **Description:** Returns JSON data from a file in the "uploads" directory based on the provided `fileId`. The data is parsed and returned as a JSON response.

### `/history`
- **Method:** GET
- **Query Parameters:**
  - `icao24` (required): The ICAO24 identifier to retrieve historical flight data.
- **Description:** Searches the "uploads" directory for JSON files, reads and parses the files, and returns a JSON response containing historical flight data for the specified `icao24` identifier.

## 6. Running the Server
To run the server:

1. Make sure you have Node.js installed on your machine.
2. Open a terminal in the directory where the JavaScript file is located.
3. Run the following command to start the server:
   
   ```
   node server.js
   ```
   
The server will start listening on port 4000, and you can access the defined endpoints as described in this documentation.
Please make sure you have the necessary JSON data files in the "uploads" directory for the server to serve data properly.
