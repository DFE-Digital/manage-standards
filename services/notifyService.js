/**
 * Author:          Andy Jones - Department for Education
 * Description:     Utility functions for the service for sending emails
 * GitHub Issue:
 */

const NotifyClient = require('notifications-node-client').NotifyClient
const notify = new NotifyClient(process.env.NOTIFY_KEY)

/**
 * Send email using Notify
 * @param {string} template - template ID from Notify
 * @param {string} recipient - email address of recipient
 * @param {object} templateParams - template parameters
 * @returns {boolean} - true if email is sent, false if errors
 * Guidance: https://docs.notifications.service.gov.uk/node.html#send-an-email
 */
const sendMagicLink = async (email, token) => {

    const templateId = process.env.MAGICLINK_TEMPLATE_ID
    const templateParams = { token: token, serviceURL: process.env.serviceURL, }

    try {
        const response = await notify.sendEmail(templateId, email, {
            personalisation: templateParams
        })

        return response

    }
    catch (error) {
        console.error('Error sending email:', error.response.data.errors)
        return false
    }
}




/**
 * Send email using Notify
 * @param {string} template - template ID from Notify
 * @param {string} recipient - email address of recipient
 * @param {object} templateParams - template parameters
 * @returns {boolean} - true if email is sent, false if errors
 * Guidance: https://docs.notifications.service.gov.uk/node.html#send-an-email
 */
function sendNotifyEmail(template, recipient, templateParams) {

    try {

        return notify
            .sendEmail(template, recipient, {
                personalisation: templateParams
            })
            .then((response) => true)
            .catch((err) => {
                console.error("Error sending email:", err);
                if (err.response) {
                    console.log("Response status:", err.response.status);
                    console.log("Response headers:", err.response.headers);
                    console.log("Response data:", err.response.data);
                }
                return false;
            });

    } catch (error) {
        next(error)
    }
}


module.exports = {
    sendMagicLink, sendNotifyEmail
};