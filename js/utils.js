
export function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (err) {
        console.error('JWT decoding failed:', err);
        return null;
    }
}

export async function fetchAndDisplayDevices(config) {
    const container = document.getElementById('device-list-container');
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading devices...</p>`;

    try {
        const res = await fetch(`${config.baseUrl}/ha_login/device/details`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                key: 'LmVKd2x5VXNLQWpFTUFOQzdaQzJTTnAwNGNlVk5TdHEwVUhTd3pBY1I4ZTRXM0w3M2dXTXJhMndHVjlqTHR0OFdiWTl6Zmk1d0F1MzlIODVUME0wR3JmcUsybHU4bF9kd25FUVZaUnFkZlhiQmVVU3VsaTZlaFdkaU5xdGlVbEppOWxJeHp6NHdVVVVqWWdzSTN4X1dfU1VmLlpyTDJqZy52cXVvUVMxVzZUemI5akFYY3ctMFAtT3NnSnk4dmhOLTJnci1CUnAtQlVEbEVoZlg1cW5IQ0tybmxtckQ0YkV4U2F0OUxRUk80YjJndHRfTHgyVzdsZw==',
                "authorization": sessionStorage.getItem("access_token")
            },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        const devices = result.data || [];

        if (devices.length === 0) {
            container.innerHTML = `<p class="text-muted">No devices found.</p>`;
            return;
        }

        container.innerHTML = ''; // clear placeholder

        devices.forEach(device => {
            const el = document.createElement('div');
            el.className = 'device-entry mb-3 p-2 border-bottom';
            const date = new Date(device.login_time);
            const formattedTime = date.toLocaleString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const browser = capitalize(device.browser_name || 'Unknown');
            const platform = device.platform || 'Unknown';

            el.innerHTML = `
                <div><strong>${browser} on ${platform}</strong></div>
                <div class="text-muted" style="font-size: 0.875rem;">Last login: ${formattedTime}</div>
            `;
            container.appendChild(el);
        });

    } catch (err) {
        console.error("Device fetch error:", err);
        container.innerHTML = `<p class="text-danger">Failed to load devices.</p>`;
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
