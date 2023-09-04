export function ajaxFetchForm(url, method, formData, _headers) {
    return fetch(url, {
        method: method,
        headers: {
            // 'Content-Type': 'application/json',
            // 'Content-Type': 'multipart/form-data; boundary=' + boundary,
            ..._headers,
        },
        body: formData,
    });
}
