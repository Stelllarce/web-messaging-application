export const logout = async () => {
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
};
