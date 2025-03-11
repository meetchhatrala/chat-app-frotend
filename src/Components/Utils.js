
export const getCookie = (name) => {
    var cookies = document.cookie.split(';')
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=')
        if (cookie[0].trim() === name) {
            return cookie[1]
        }
    }
}
