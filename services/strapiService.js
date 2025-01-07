
require('dotenv').config();

const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');
const { token } = require('morgan');

const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1338';
const STRAPI_API_KEY = process.env.STRAPI_API_KEY;
const cacheTimeout = process.env.CacheTimeout;

// Initialize Axios instance with default headers
const strapiClient = axios.create({
    baseURL: STRAPI_API_URL,
    headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
    },
});

// Initialize cache (cache for 1 hour)
const cache = new NodeCache({ stdTTL: cacheTimeout });



const getUser = async (email) => {
    if (!email || typeof email !== 'string') {
        throw new Error("Invalid email: A valid string email must be provided.");
    }

    try {
        const response = await strapiClient.get(`/api/users`, {
            params: {
                'filters[email][$eq]': email
            }
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return null; // Return null if no users match the email
        }

        // Return the user data

        //ToDo: Recycle the token

        return response.data[0]; // Assuming email is unique and returning the first match
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch user with email: ${email}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching user: ${error.message}`);
    }
};



const getAdmins = async () => {

    try {
        const response = await strapiClient.get(`/api/users`, {
            params: {
                'filters[Administrator][$eq]': 1
            }
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return null; // Return null if no users match the email
        }

        return response.data;
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch admins`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching users: ${error.message}`);
    }
};



const createUser = async (email) => {
    if (!email || typeof email !== 'string') {
        throw new Error("Invalid email: A valid string email must be provided.");
    }

    try {
        // Adjust payload to match Strapi's expected structure
        const payload = {
            email: email, // Required field
            username: email, // Ensure this field matches your schema
            password: Math.random().toString(36).substring(2, 12), // Default random password
            confirmed: true, // Only if required by your API
            blocked: false, // Only if required by your API
            role: 1,
            token: Math.random().toString(36).substring(2, 30)
        };

        const response = await strapiClient.post(`/api/users`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the user data
        return response.data;
    } catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to create user with email: ${email}`, error.message);
        throw new Error(`Error creating user: ${error.message}`);
    }
};

const getUserByToken = async (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error("Invalid token: A valid string token must be provided.");
    }

    try {
        const response = await strapiClient.get(`/api/users`, {
            params: {
                'filters[token][$eq]': token
            }
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return null; // Return null if no users match the token
        }

        // Return the user data
        return response.data[0]; // Assuming token is unique and returning the first match
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch user with token: ${token}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

const updateUser = async (user) => {
    if (!user || typeof user !== 'object') {
        throw new Error("Invalid user: A valid user object must be provided.");
    }

    try {
        const response = await strapiClient.put(`/api/users/${user.id}`, user);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated user data
        return response.data;
    } catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update user with ID: ${user.id}`, error.message);
        throw new Error(`Error updating user: ${error.message}`);
    }
};

const getStandardsOwnedByUser = async (userId) => {
    if (!userId || typeof userId !== 'number') {
        throw new Error("Invalid user ID: A valid numeric user ID must be provided.");
    }

    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                'filters[owners][id][$eq]': userId,
            },
        });

        console.log(response.data.data);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data.data) || response.data.length === 0) {
            return []; // Return empty array if no standards are owned by the user
        }

        // Return the standards data
        return response.data.data;
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standards owned by user ID: ${userId}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standards: ${error.message}`);
    }
};

const getStandardBySlug = async (slug) => {
    if (!slug || typeof slug !== 'string') {
        throw new Error("Invalid slug: A valid string slug must be provided.");
    }

    console.log(slug)

    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                'filters[slug][$eq]': slug,
                status: 'Draft',
                populate: '*',
            },
        });


        // Return the standard data
        return response.data.data[0]; // Assuming slug is unique and returning the first match
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standard with slug: ${slug}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standard: ${error.message}`);
    }
};

const getDraftsForApproval = async () => {

    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                status: 'Draft',
                'filters[stage][title][$eq]': 'Approval',
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data.data) || response.data.length === 0) {
            return []; // Return empty array if no standards are owned by the user
        }

        // Return the standards data
        return response.data.data;
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standards owned by user ID: ${userId}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standards: ${error.message}`);
    }
};


const getStandardsDraftByUser = async (userId) => {
    if (!userId || typeof userId !== 'number') {
        throw new Error("Invalid user ID: A valid numeric user ID must be provided.");
    }

    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                'filters[creator][id][$eq]': userId,
                status: 'Draft',
                'filters[stage][title][$eq]': 'Draft',
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data.data) || response.data.length === 0) {
            return []; // Return empty array if no standards are owned by the user
        }

        // Return the standards data
        return response.data.data;
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standards owned by user ID: ${userId}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standards: ${error.message}`);
    }
};
const createStandardDraft = async (userId, title) => {
    if (!userId || typeof userId !== 'number') {
        throw new Error("Invalid user ID: A valid numeric user ID must be provided.");
    }

    if (!title || typeof title !== 'string') {
        throw new Error("Invalid title: A valid string title must be provided.");
    }

    try {
        const payload = {
            data: {
                title: title,
                stage: 3,
                creator: userId,
                previousVersion: 0,
                draftCreated: new Date(),
                slug: title.toLowerCase().replace(/ /g, '-'),
                publishedAt: null // ensure it remains a draft
            }
        };

        const response = await strapiClient.post(`/api/standards?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
            if (error.response?.data?.error?.details?.errors) {
                error.response.data.error.details.errors.forEach(err => {
                    console.error(`Error: ${err.message}`);
                });
            }
        }

        console.error(`Failed to create standard draft for user ID: ${userId}`, error.message);
        throw new Error(`Error creating standard draft: ${error.message}`);
    }
};

const updateTitle = async (id, title) => {
    if (!title || typeof title !== 'string') {
        throw new Error("Invalid title: A valid string must be provided.");
    }

    try {
        const payload = {
            data: {
                title: title,
                slug: title.toLowerCase().replace(/ /g, '-'),
                publishedAt: null // ensure the entry remains a draft
            }
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }



        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response.data.error);
            return error.response.data;
        }

        throw new Error(`Error updating title: ${error.message}`);
    }
};



const updateSummary = async (id, summary) => {
    if (!summary || typeof summary !== 'string') {
        throw new Error("Invalid summary: A valid summary object must be provided.");
    }

    try {

        const payload = {
            data: {
                summary: summary
            }
        };
        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        console.log(response.data);

        // Return the updated summary data
        return response.data.data;
    } catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update summary with ID: ${summary.id}`, error.message);
        throw new Error(`Error updating summary: ${error.message}`);
    }
};



const updatePurpose = async (id, purpose) => {
    if (!purpose || typeof purpose !== 'string') {
        throw new Error("Invalid purpose: A valid purpose object must be provided.");
    }

    try {

        const payload = {
            data: {
                purpose: purpose
            }
        };
        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated purpose data
        return response.data.data;
    } catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update purpose with ID: ${purpose.id}`, error.message);
        throw new Error(`Error updating purpose: ${error.message}`);
    }
};

const updateMeet = async (id, meet) => {
    if (!meet || typeof meet !== 'string') {
        throw new Error("Invalid meet: A valid meet object must be provided.");
    }

    try {

        const payload = {
            data: {
                howToMeet: meet
            }
        };
        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated meet data
        return response.data.data;
    } catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update meet with ID: ${meet.id}`, error.message);
        throw new Error(`Error updating meet: ${error.message}`);
    }
};

const getStandardDraft = async (id, userId) => {
    // Get the standard draft by ID and where the creator is the user

    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                'filters[creator][id][$eq]': userId,
                status: 'Draft',
                'filters[id][$eq]': id,
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the standard data

        return response.data.data[0];
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standard with id: ${id}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standard: ${error.message}`);
    }
};

const addAdmin = async (firstName, lastName, email) => {

    try {

        // Check first if user exists, if they do, make them an admin

        const user = await getUser(email);

        if (user) {
            const payload = {
                Administrator: 1

            };

            const response = await strapiClient.put(`/api/users/${user.id}`, payload);

            if (!response || !response.data) {
                throw new Error("Unexpected response format from Strapi API.");
            }

            return response.data.data;
        }
        else {



            const payload = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                role: 1,
                Administrator: 1,
                username: email,
                password: Math.random().toString(36).substring(2, 12), // Default random password
                confirmed: true,
                blocked: false,
                token: Math.random().toString(36).substring(2, 30)

            };

            const response = await strapiClient.post(`/api/users`, payload);

            if (!response || !response.data) {
                throw new Error("Unexpected response format from Strapi API.");
            }

            return response.data.data;
        }
    }
    catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
            // What are the errors
            if (error.response?.data?.error?.details?.errors) {
                error.response.data.error.details.errors.forEach(err => {
                    console.error(`Error: ${err.message}`);
                });
            }

            return error.response.data;
        }

        throw new Error(`Error adding admin: ${error.message}`);
    }
}


const getUserById = async (id) => {


    try {
        const response = await strapiClient.get(`/api/users`, {
            params: {
                'filters[id][$eq]': id
            }
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        if (!Array.isArray(response.data) || response.data.length === 0) {
            return null; // Return null if no users match the email
        }

        // Return the user data

        //ToDo: Recycle the token

        return response.data[0]; // Assuming email is unique and returning the first match
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch user with email: ${email}`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

// set Administrator to 0 for given documentId

const removeAdmin = async (id) => {

    try {

        const payload = {
            Administrator: 0
        };

        const response = await strapiClient.put(`/api/users/${id}`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;

    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
            return error.response.data;
        }

        throw new Error(`Error removing admin: ${error.message}`);
    }
}


module.exports = {
    getUser, createUser, getUserByToken, updateUser, getStandardsOwnedByUser, getStandardBySlug, getStandardsDraftByUser, createStandardDraft, updateSummary, updatePurpose, updateMeet, updateTitle, getStandardDraft, getDraftsForApproval, getAdmins, addAdmin, getUserById, removeAdmin
};
