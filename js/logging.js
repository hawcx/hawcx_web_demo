// logging.js - Logging system for client and server events

/**
 * Sets up the logging system for the application
 * @param {HTMLElement} clientLogOutput - DOM element for client logs
 * @param {HTMLElement} serverLogOutput - DOM element for server logs
 * @returns {Object} Object containing logging functions
 */
export function setupLogging(clientLogOutput, serverLogOutput) {
    /**
     * Appends a log entry to the specified log container
     */
    function appendLogEntry(logContainer, origin, message, type = 'info', data = null) {
        if (!logContainer) return;
        
        const placeholder = logContainer.querySelector('.log-placeholder');
        if (placeholder) placeholder.remove();

        const entry = document.createElement('div');
        entry.classList.add('log-entry');
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const dataString = data ? `<pre class="log-data">${JSON.stringify(data, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>` : '';
        
        entry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-origin">${origin}</span>
            <span class="log-message log-type-${type}">${safeMessage}</span>
            ${dataString}
        `;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Logs a message to the client log panel
     */
    function logClient(message, type = 'info', data = null) {
        appendLogEntry(clientLogOutput, '[Client]', message, type, data);
        
        const consoleArgs = [`[Client Log] ${message}`];
        if (data) consoleArgs.push(data);
        
        switch(type) {
            case 'error':
                console.error(...consoleArgs);
                break;
            case 'warning':
                console.warn(...consoleArgs);
                break;
            default:
                console.log(...consoleArgs);
        }
    }

    /**
     * Logs a message to the server log panel
     */
    function logServer(message, type = 'info', data = null) {
        appendLogEntry(serverLogOutput, '[Server]', message, type, data);
    }

    return {
        logClient,
        logServer,
        appendLogEntry
    };
}