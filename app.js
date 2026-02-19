/**
 * RESTful API for Managing Users
 * 
 * This is a simple RESTful API built with Node.js and Express
 * that demonstrates routing, middleware, HTTP methods, status codes,
 * error handling, and in-memory data storage.
 * 
 * Routes:
 * - GET /users - Fetch all users
 * - GET /users/:id - Fetch a specific user by ID
 * - POST /user - Add a new user
 * - PUT /user/:id - Update an existing user
 * - DELETE /user/:id - Delete a user by ID
 */

// Import Express framework
const express = require('express');

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
// This allows us to read JSON data sent in POST and PUT requests
app.use(express.json());

// ============================================
// IN-MEMORY DATA STORE
// ============================================
// We're using an array to store user data in memory
// This is a simple approach for demonstration purposes
// In production, you would use a database like MongoDB, PostgreSQL, etc.
let users = [
    {
        id: "1",
        firstName: "Anshika",
        lastName: "Agarwal",
        hobby: "Teaching"
    },
    {
        id: "2",
        firstName: "John",
        lastName: "Doe",
        hobby: "Reading"
    },
    {
        id: "3",
        firstName: "Jane",
        lastName: "Smith",
        hobby: "Coding"
    }
];

// Variable to generate unique IDs for new users
let nextId = 4;

// ============================================
// MIDDLEWARE 1: REQUEST LOGGING
// ============================================
// This middleware logs details of each request including:
// - HTTP method
// - URL path
// - Status code (captured after response is sent)
// - Timestamp
const loggingMiddleware = (req, res, next) => {
    // Store the original send function to capture status code
    const originalSend = res.send;
    
    // Override send to capture the status code
    res.send = function(body) {
        // Log request details
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        // Call original send function
        return originalSend.call(this, body);
    };
    
    // Continue to the next middleware/route handler
    next();
};

// Apply logging middleware to all routes
app.use(loggingMiddleware);

// ============================================
// MIDDLEWARE 2: VALIDATION
// ============================================
// This middleware validates required fields for POST and PUT requests
// Required fields: firstName, lastName, hobby
const validationMiddleware = (req, res, next) => {
    // Get the HTTP method
    const method = req.method;
    
    // Only validate POST and PUT requests
    if (method === 'POST' || method === 'PUT') {
        // Extract user data from request body
        const { firstName, lastName, hobby } = req.body;
        
        // Array to store validation errors
        const errors = [];
        
        // Check if firstName is provided and is a string
        if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            errors.push('firstName is required and must be a non-empty string');
        }
        
        // Check if lastName is provided and is a string
        if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            errors.push('lastName is required and must be a non-empty string');
        }
        
        // Check if hobby is provided and is a string
        if (!hobby || typeof hobby !== 'string' || hobby.trim() === '') {
            errors.push('hobby is required and must be a non-empty string');
        }
        
        // If there are validation errors, return 400 Bad Request
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
    }
    
    // If validation passes, continue to the next middleware/route handler
    next();
};

// Apply validation middleware to all routes
app.use(validationMiddleware);

// ============================================
// ROUTES
// ============================================

// --------------------------------------------------------
// GET /users - Fetch all users
// Returns: Array of all users
// Status Code: 200 (OK)
// --------------------------------------------------------
app.get('/users', (req, res) => {
    // Return all users with 200 OK status
    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
    });
});

// --------------------------------------------------------
// GET /users/:id - Fetch a specific user by ID
// Returns: User object if found
// Status Codes: 200 (OK), 404 (Not Found)
// --------------------------------------------------------
app.get('/users/:id', (req, res) => {
    // Extract the user ID from the request parameters
    const userId = req.params.id;
    
    // Find the user in the array by ID
    const user = users.find(u => u.id === userId);
    
    // If user not found, return 404 Not Found
    if (!user) {
        return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
        });
    }
    
    // If user found, return 200 OK with user data
    res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
    });
});

// --------------------------------------------------------
// POST /user - Add a new user
// Request Body: { firstName, lastName, hobby }
// Returns: The newly created user object
// Status Codes: 201 (Created), 400 (Bad Request)
// --------------------------------------------------------
app.post('/user', (req, res) => {
    // Extract user data from request body
    const { firstName, lastName, hobby } = req.body;
    
    // Create a new user object with a unique ID
    const newUser = {
        id: String(nextId++),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        hobby: hobby.trim()
    };
    
    // Add the new user to the users array
    users.push(newUser);
    
    // Return 201 Created with the new user data
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
    });
});

// --------------------------------------------------------
// PUT /user/:id - Update an existing user
// Request Body: { firstName, lastName, hobby }
// Returns: The updated user object
// Status Codes: 200 (OK), 400 (Bad Request), 404 (Not Found)
// --------------------------------------------------------
app.put('/user/:id', (req, res) => {
    // Extract the user ID from the request parameters
    const userId = req.params.id;
    
    // Find the index of the user in the array
    const userIndex = users.findIndex(u => u.id === userId);
    
    // If user not found, return 404 Not Found
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
        });
    }
    
    // Extract updated user data from request body
    const { firstName, lastName, hobby } = req.body;
    
    // Update the user object
    users[userIndex] = {
        id: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        hobby: hobby.trim()
    };
    
    // Return 200 OK with the updated user data
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: users[userIndex]
    });
});

// --------------------------------------------------------
// DELETE /user/:id - Delete a user by ID
// Returns: Success message
// Status Codes: 200 (OK), 404 (Not Found)
// --------------------------------------------------------
app.delete('/user/:id', (req, res) => {
    // Extract the user ID from the request parameters
    const userId = req.params.id;
    
    // Find the index of the user in the array
    const userIndex = users.findIndex(u => u.id === userId);
    
    // If user not found, return 404 Not Found
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: `User with ID ${userId} not found`
        });
    }
    
    // Remove the user from the array
    const deletedUser = users.splice(userIndex, 1);
    
    // Return 200 OK with success message
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser[0]
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// This middleware handles any errors that occur in the application
// It should be defined after all routes
app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error('Error occurred:', err);
    
    // Return 500 Internal Server Error
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message || 'An unexpected error occurred'
    });
});

// ============================================
// START THE SERVER
// ============================================
// Define the port number
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET    /users        - Get all users');
    console.log('  GET    /users/:id    - Get user by ID');
    console.log('  POST   /user         - Create new user');
    console.log('  PUT    /user/:id     - Update user by ID');
    console.log('  DELETE /user/:id     - Delete user by ID');
});
