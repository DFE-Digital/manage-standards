
require('dotenv').config();

const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');
const { token } = require('morgan');
const e = require('express');

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

const createUserFull = async (firstName, lastName, email, jobRole) => {
    if (!email || typeof email !== 'string') {
        throw new Error("Invalid email: A valid string email must be provided.");
    }

    try {
        // Adjust payload to match Strapi's expected structure
        const payload = {
            email: email, // Required field
            firstName: firstName,
            lastName: lastName,
            jobRole: jobRole,
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

        // get standards where the owners, contacts or creator 

        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                'filters[owners][id][$eq]': userId,
            },
        });

        // console.log(response.data.data);

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

const getStandardsOwnedByUserDocumentId = async (userId) => {

    try {

        // get standards where the owners, contacts or creator 

        console.log(userId);


        const creatorResponse = await strapiClient.get(`/api/standards`, {
            params: {
                populate: 'stage',
                status: 'Draft',
                'filters[creator][documentId][$eq]': userId,
                fields: 'id,title,documentId,firstPublished,version,updatedAt,standardId'
            },
        });

        const ownersResponse = await strapiClient.get(`/api/standards`, {
            params: {
                populate: 'stage',
                status: 'Draft',
                'filters[owners][documentId][$contains]': userId,
                fields: 'id,title,documentId,firstPublished,version,updatedAt,standardId'
            },
        });

        console.log(creatorResponse.data.data);
        console.log(ownersResponse.data.data);

        const mergedData = [...creatorResponse.data.data, ...ownersResponse.data.data];

        console.log(mergedData);

        // Dedupe the array based on documentId
        const uniqueData = mergedData.filter((v, i, a) => a.findIndex(t => (t.documentId === v.documentId)) === i);

        console.log(uniqueData);
     
        return uniqueData
    } catch (error) {

        console.log(error.response.data.error);

    }
};

const getStandardBySlug = async (slug) => {
    if (!slug || typeof slug !== 'string') {
        throw new Error("Invalid slug: A valid string slug must be provided.");
    }

    // console.log(slug)

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

const getStandardByDocumentId = async (documentId) => {


    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                'filters[documentId][$eq]': documentId,
                populate: '*',
                status: 'Draft'
            },
        });



        // Return the standard data
        return response.data.data[0]; // Assuming slug is unique and returning the first match
    } catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standard with id: ${documentId}`, error.message);

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
        // Step 1: Create the draft
        const createPayload = {
            data: {
                title: title,
                stage: 3,
                creator: userId,
                previousVersion: 0,
                draftCreated: new Date(),
                slug: title
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9-]+/g, '') // Remove invalid characters
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/-+/g, '-'), // Ensure no multiple hyphens
                publishedAt: null // Ensure it remains a draft
            }
        };

        // console.log('Creating standard draft with payload:', createPayload);
        const createResponse = await strapiClient.post(`/api/standards?status=draft`, createPayload);
        // console.log('Draft created successfully:', createResponse.data);

        if (!createResponse || !createResponse.data) {
            throw new Error("Unexpected response format from Strapi API during creation.");
        }

        const standardId = createResponse.data.data.id;
        // console.log(`Draft ID: ${standardId}`);

        // Step 2: Update the standardId field
        const updatePayload = {
            data: {
                standardId: standardId
            }
        };

        let success = false;
        const maxRetries = 5;
        let attempt = 0;

        while (!success && attempt < maxRetries) {
            try {
                // console.log(`Attempt ${attempt + 1} to update standard ID: ${standardId}`);
                const updateResponse = await strapiClient.put(`/api/standards/${createResponse.data.data.documentId}?status=draft`, updatePayload);

                if (updateResponse && updateResponse.data) {
                    // console.log('Standard ID updated successfully:', updateResponse.data);
                    success = true;
                    return updateResponse.data.data;
                }
            } catch (updateError) {
                attempt++;
                console.error(`Update attempt ${attempt} failed. Retrying in 2 seconds...`);
                console.error('Error:', updateError.message);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!success) {
            throw new Error("Failed to update the standard ID after multiple attempts.");
        }
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
            console.error('Details:', error.response?.data?.error?.details);
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

        // console.log(response.data);

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

const updateGovernance = async (id, governance) => {

    if (!governance || typeof governance !== 'string') {
        throw new Error("Invalid governance: A valid governance object must be provided.");
    }

    try {

        const payload = {
            data: {
                governance: governance
            }
        };
        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated governance data
        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context

        console.error(`Failed to update governance with ID: ${governance.id}`, error.message);
        throw new Error(`Error updating governance: ${error.message}`);
    }
};

const updateLegality = async (id, legality) => {

    if (!legality || typeof legality !== 'string') {
        throw new Error("Invalid legality: A valid legality object must be provided.");
    }

    legality = legality === 'yes' ? 1 : 0;

    // console.log(legality);

    try {

        const payload = {
            data: {
                legalStandard: legality
            }
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated legality data

        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update legality with ID: ${legality.id}`, error.message);
        throw new Error(`Error updating legality: ${error.message}`);
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
                'filters[documentId][$eq]': id,
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

const getPreview = async (documentId) => {
    try {
        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                status: 'Draft',
                'filters[documentId][$eq]': documentId,
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

const getStandards = async () => {

    try {

        const response = await strapiClient.get(`/api/standards`, {
            params: {
                populate: '*',
                'filters[stage][title][$eq]': 'Published',
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        return response.data.data;
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standards`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standards: ${error.message}`);
    }
}

// Returns number of published standards
const getCountStandards = async () => {

    try {

        const response = await strapiClient.get(`/api/standards`, {
            params: {
                'filters[stage][title][$eq]': 'Published',
                fields: 'id'
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        return response.data.data.length;
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch standards`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching standards: ${error.message}`);
    }
}

const getCategories = async () => {

    try {

        const response = await strapiClient.get(`/api/categories`, {
            params: {
                'filters[active][$eq]': 1,
                sort: 'title',
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // console.log(response.data.data);

        // Ensure data is an array or handle empty results
        return response.data.data;
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch categories`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching categories: ${error.message}`);
    }
}



const getSubCategories = async (categories) => {
    try {

        const response = await strapiClient.get(`/api/sub-categories`, {
            params: {
                'filters[active][$eq]': 1,
                sort: 'title', populate: '*',
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // console.log(response.data.data);

        // Ensure data is an array or handle empty results
        return response.data.data;
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch subcategories`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching subcategories: ${error.message}`);
    }
}

const getProducts = async () => {
    try {

        const response = await strapiClient.get(`/api/products`, {
            params: {
                sort: 'title', populate: '*',
                fields: 'documentId,title,vendor,version'
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // console.log(response.data.data);

        // Ensure data is an array or handle empty results
        return response.data.data;
    }
    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch products`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching products: ${error.message}`);
    }
}



// Update cateogories for a given standard
// They will be a comma separated string of category ids which need to be converted to an array and linked to the standard based on the Id


const updateCategories = async (id, selectedCategories) => {

    try {

        // console.log(selectedCategories);

        const payload = {
            data: {
                categories: selectedCategories
            }
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated categories data
        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update categories with ID: ${selectedCategories.id}`, error.message);
        throw new Error(`Error updating categories: ${error.message}`);
    }
}

// Update the standard to set the approvedProducts to the selectedProduct if productType is 'Approved' and to set the toleratedProducts to the selectedProduct if productType is 'Tolerated'

const updateProducts = async (id, selectedProduct, productType) => {

    try {

        let payload = {}

        if (productType === 'Approved') {
            payload = {
                data: {
                    approvedProducts: selectedProduct
                }
            };
        }

        if (productType === 'Tolerated') {
            payload = {
                data: {
                    toleratedProducts: selectedProduct
                }
            };
        }


        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated products data
        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update products with ID: ${selectedProduct.id}`, error.message);
        throw new Error(`Error updating products: ${error.message}`);
    }
}

// Remove the approved product  with the given documentId for the standards 
// accepts standardDocumentId and productDocumentId
// Get the current list, filter out the approvedProducts documentId and update the standard

const removeApprovedProduct = async (standardDocumentId, productDocumentId) => {

    try {

        // console.log(standardDocumentId, productDocumentId);

        const standard = await getStandardByDocumentId(standardDocumentId);

        // console.log(standard);

        const approvedProducts = standard.approvedProducts.filter(product => product.documentId !== productDocumentId);

        const payload = {
            data: {
                approvedProducts: approvedProducts
            }
        };

        const response = await strapiClient.put(`/api/standards/${standard.documentId}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated products data
        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to remove approved product with ID: ${productDocumentId}`, error.message);
        throw new Error(`Error removing approved product: ${error.message}`);
    }
}

const removeToleratedProduct = async (standardDocumentId, productDocumentId) => {

    try {

        // console.log(standardDocumentId, productDocumentId);

        const standard = await getStandardByDocumentId(standardDocumentId);

        // console.log(standard);

        const toleratedProducts = standard.toleratedProducts.filter(product => product.documentId !== productDocumentId);

        const payload = {
            data: {
                toleratedProducts: toleratedProducts
            }
        };

        const response = await strapiClient.put(`/api/standards/${standard.documentId}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated products data
        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to remove tolerated product with ID: ${productDocumentId}`, error.message);
        throw new Error(`Error removing tolerated product: ${error.message}`);
    }
}

// updateValidity
const updateValidity = async (id, validity) => {


    try {

        const payload = {
            data: {
                validityPeriod: validity
            }
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Return the updated validity data

        return response.data.data;

    } catch (error) {

        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update validity with ID: ${validity.id}`, error.message);
        throw new Error(`Error updating validity: ${error.message}`);
    }
}

// updateException
// standard.documentId, exception, exceptiondetail
// Create the exception in the exception type, get the exception documentId and update the standard.exceptions with the exception documentId
const updateException = async (id, exception, exceptionDetail) => {
    try {
        // Step 1: Create the exception
        const createPayload = {
            data: {
                title: exception,
                details: exceptionDetail,
                active: true, // Assuming 'active' is a valid field in your Exception model
            },
        };

        const createResponse = await strapiClient.post(`/api/exceptions`, createPayload);

        if (!createResponse || !createResponse.data) {
            throw new Error("Unexpected response format from Strapi API during exception creation.");
        }

        const exceptionId = createResponse.data.data.documentId; // Use `id` from the response

        if (!exceptionId) {
            throw new Error("Failed to retrieve the exception ID from the response.");
        }

        // Step 2: Fetch the current standard
        const standard = await getStandardByDocumentId(id);

        if (!standard) {
            throw new Error(`Standard with documentId "${id}" not found.`);
        }

        const { exceptions } = standard;

        // Step 3: Append the new exception's ID
        const updatedExceptions = [...exceptions.map((e) => e.documentId), exceptionId]; // Ensure we pass IDs only

        // Step 4: Update the standard with the updated exceptions
        const payload = {
            data: {
                exceptions: updatedExceptions, // Array of exception IDs
            },
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API during standard update.");
        }

        return response.data.data; // Return the updated standard
    } catch (error) {
        if (error.response) {
            console.error("Strapi API Error:", error.response.data.error || error.response.data);
        }
        console.error(`Failed to update exception for standard with ID: ${id}`, error.message);
        throw new Error(`Error updating exception: ${error.message}`);
    }
};

const removeException = async (standardDocumentId, exceptionDocumentId) => {
    try {
        // console.log(standardDocumentId, exceptionDocumentId);

        const standard = await getStandardByDocumentId(standardDocumentId);
        // console.log(standard);

        const exceptions = standard.exceptions
            .filter(exception => exception.documentId !== exceptionDocumentId)
            .map(exception => exception.documentId);


        const payload = { data: { exceptions } };
        // console.log(payload);

        const response = await strapiClient.put(`/api/standards/${standard.documentId}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Then delete the exception in the exception type

        const deleteResponse = await strapiClient.delete(`/api/exceptions/${exceptionDocumentId}`);

        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response.data);
        }
        console.error(`Failed to remove exception with ID: ${exceptionDocumentId}`, error.message);
        throw new Error(`Error removing exception: ${error.message}`);
    }
};

// getPeople

const getPeople = async () => {

    try {

        const response = await strapiClient.get(`/api/users`, {
            params: {
                sort: 'firstName',
                'filters[confirmed][$eq]': 1,
            },
        });

        // Validate response structure
        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        // Ensure data is an array or handle empty results
        return response.data;
    }

    catch (error) {
        // Log the error with additional context
        console.error(`Failed to fetch people`, error.message);

        // Rethrow the error with a meaningful message
        throw new Error(`Error fetching people: ${error.message}`);
    }
}

// updatePeople
//standard.documentId, contactType, people, firstName, lastName, email, jobRole);

const updatePeople = async (id, contactType, people, firstName, lastName, email, jobRole) => {

    // if people exists, update the standard - if contactType === 'Owner' then update Owners, if contactType === 'Contact' then update Contacts     

    try {
        let payload = {}

        if (people.length !== 0) {

            // append Owners and Contacts to the standard

            const standard = await getStandardByDocumentId(id);



            if (contactType === 'Owner') {

                const { owners } = standard;
                const updatedOwners = [...owners.map((e) => e.documentId), people];

                payload = {
                    data: {
                        owners: updatedOwners
                    }
                };
            }

            if (contactType === 'Contact') {

                const { contacts } = standard;
                const updatedContacts = [...contacts.map((e) => e.documentId), people];

                payload = {
                    data: {
                        contacts: updatedContacts
                    }
                };
            }

            const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        }

        if (people.length === 0) {

            //  Create a user and add them to the standard
            const newUser = await createUserFull(firstName, lastName, email, jobRole);

            if (contactType === 'Owner') {
                payload = {
                    data: {
                        owners: [newUser]
                    }
                };
            }

            if (contactType === 'Contact') {
                payload = {
                    data: {
                        contacts: [newUser]
                    }
                };
            }

            const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);
        }
    }

    catch (error) {
        // Handle Axios-specific errors
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        // Log and rethrow the error with context
        console.error(`Failed to update people with ID: ${people.id}`, error.message);
        throw new Error(`Error updating people: ${error.message}`);

    }
}

const removeOwner = async (standardDocumentId, ownerDocumentId) => {
    try {
        // console.log(standardDocumentId, exceptionDocumentId);

        const standard = await getStandardByDocumentId(standardDocumentId);
        // console.log(standard);

        const owners = standard.owners
            .filter(owner => owner.documentId !== ownerDocumentId)
            .map(owner => owner.documentId);


        const payload = { data: { owners } };
        // console.log(payload);

        const response = await strapiClient.put(`/api/standards/${standard.documentId}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response.data);
        }
        console.error(`Failed to remove exception with ID: ${exceptionDocumentId}`, error.message);
        throw new Error(`Error removing exception: ${error.message}`);
    }
};

const removeContact = async (standardDocumentId, contactDocumentId) => {
    try {
        // console.log(standardDocumentId, exceptionDocumentId);

        const standard = await getStandardByDocumentId(standardDocumentId);
        // console.log(standard);

        const contacts = standard.contacts
            .filter(contact => contact.documentId !== contactDocumentId)
            .map(contact => contact.documentId);


        const payload = { data: { contacts } };
        // console.log(payload);

        const response = await strapiClient.put(`/api/standards/${standard.documentId}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response.data);
        }
        console.error(`Failed to remove exception with ID: ${exceptionDocumentId}`, error.message);
        throw new Error(`Error removing exception: ${error.message}`);
    }
};

const getStageDocumentId = async (stage) => {

    const payload = {
        params: {
            'filters[title][$eq]': stage,
        },
    };

    const result = await strapiClient.get(`/api/stages`, payload);

    if (!result || !result.data) {
        throw new Error("Unexpected response format from Strapi API.");
    }

    return result.data.data[0].documentId;
}



const submitStandard = async (id) => {

    try {

        const stage = await getStageDocumentId('Approval');

        const payload = {
            data: {
                stage: stage
            }
        };

        console.log(stage)

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;

    }
    catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        throw new Error(`Error submitting standard: ${error.message}`);
    }
}


const updateSubCategories = async (id, selectedSubCategories) => {
    
    try {

        console.log(selectedSubCategories);

        const payload = {
            data: {
                sub_categories: selectedSubCategories
            }
        };

        const response = await strapiClient.put(`/api/standards/${id}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;

    } catch (error) {

        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        console.error(`Failed to update subcategories with ID: ${selectedSubCategories.id}`, error.message);
        throw new Error(`Error updating subcategories: ${error.message}`);
    }
}

const submitOutcome = async (documentId, outcome) => {
    
    try {

        const stage = await getStageDocumentId(outcome);

        const payload = {
            data: {
                stage: stage
            }
        };

        const response = await strapiClient.put(`/api/standards/${documentId}?status=draft`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;

    }
    catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        throw new Error(`Error submitting standard: ${error.message}`);
    }
}


const saveStandardComments = async (documentId, userId, outcome, comments) => {
    try {

        console.log(documentId, userId, outcome, comments);

        const payload = {
            data: {
                standard: documentId,
                user: userId,
                title: 'Standard ' + outcome.toLowerCase(),
                comments: comments,
                dateCreated: new Date()
            }
        };

        const response = await strapiClient.post(`/api/standard-comments`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;

    }
    catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        throw new Error(`Error saving comments: ${error.message}`);
    }
}

const getStandardComments = async (documentId) => {
    try {
        const response = await strapiClient.get(`/api/standard-comments`, {
            params: {
                'filters[standard][documentId][$eq]': documentId,
                sort: 'dateCreated:desc',
                populate: {
                    standard: true, // Populate the related `standard` entries
                }
            },
        });

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;
    } catch (error) {
        console.error(`Failed to fetch comments for standard with documentId: ${documentId}`, error.message);
        throw new Error(`Error fetching comments: ${error.message}`);
    }
};

const publishStandard = async (documentId) => {
    try {

        const currentStandard = await getStandardByDocumentId(documentId);

        const stage = await getStageDocumentId('Published');

        const payload = {
            data: {
                stage: stage,
                firstPublished: new Date(),
                lastUpdated: new Date(),
                version: 1,
                previousVersion: currentStandard.version
            }
        };

        const response = await strapiClient.put(`/api/standards/${documentId}`, payload);

        if (!response || !response.data) {
            throw new Error("Unexpected response format from Strapi API.");
        }

        return response.data.data;
    } catch (error) {
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error);
        }

        throw new Error(`Error publishing standard: ${error.message}`);
    }
}
const createAuditLog = async (payload) => {
    try {
        if (!payload || !payload.data || typeof payload.data !== 'object') {
            throw new Error('Invalid payload format. Expected an object with a "data" property.');
        }
        
        const response = await strapiClient.post('/api/audits', payload);

        // Check response structure
        if (!response || !response.data) {
            throw new Error('Unexpected response format from Strapi API.');
        }
    } catch (error) {
        // Log error details
        if (error.response) {
            console.error('Strapi API Error:', error.response?.data?.error || 'No additional error details.');
        } else {
            console.error('Unexpected Error:', error.message);
        }

        // Re-throw error for upstream handling
        throw new Error(`Error creating audit log: ${error.message}`);
    }
};





module.exports = {
    getUser, createUser, getUserByToken, updateUser, getStandardsOwnedByUser, getStandardsOwnedByUserDocumentId, getStandardBySlug, getStandardsDraftByUser, createStandardDraft, updateSummary, updatePurpose, updateMeet, updateTitle, getStandardDraft, getDraftsForApproval, getAdmins, addAdmin, getUserById, removeAdmin, getStandards, getCountStandards, getStandardByDocumentId, updateGovernance, updateLegality, getPreview, getCategories, updateCategories, getSubCategories, getProducts, updateProducts, removeApprovedProduct, removeToleratedProduct, updateValidity, updateException, removeException, getPeople, updatePeople, removeOwner, removeContact, submitStandard, updateSubCategories, submitOutcome, saveStandardComments, getStandardComments, publishStandard, createAuditLog
};
