// cookies.js
export function getCookie(name: string) {
  const cookies = document.cookie.split('; ');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function parseUserData() {
  const userData = getCookie('userData');
  console.log(userData)
  return userData ? JSON.parse(userData) : null;
}

export function checkAuth() {
  // Check if userData exists
  const userData = parseUserData();
  
  if (userData) {
    return {
      isAuthenticated: true,
      user: userData
    };
  }
  
  return {
    isAuthenticated: false,
    user: null
  };
}