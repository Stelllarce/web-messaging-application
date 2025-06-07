import config from '../config';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (res.status === 403) {
    const refreshRes = await fetch(`${config.API_BASE_URL}/auth/token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshRes.ok) throw new Error('Session expired. Please log in again.');

    const { accessToken: newAccessToken } = await refreshRes.json();
    localStorage.setItem('accessToken', newAccessToken);

    // повторен опит
    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
      credentials: 'include',
    });
  }

  return res;
};

export const storeUserIdFromApi = async () => {
  try {
    const res = await fetchWithAuth(`${config.API_BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Unsuccessful call to /auth/id');

    const data = await res.json();
    if (!data.id) throw new Error('User ID not found in response');

    localStorage.setItem('userId', data.id);
    return data.id;
  } catch (err) {
    console.error('Failed to extract user ID', err);
    return null;
  }
};