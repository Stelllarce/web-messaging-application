import config from '../config';

export const logout = async () => {
  await fetch(`${config.API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
};
