import { get, post } from '.';

export async function login(email, password) {
  return await post('/users/login', {
      email,
      password
  });
}

export async function checkLogin() {
  return await get('/users/checkLogin');
}

export async function logout() {
  return await get('/users/logout');
}

export async function checkEmailRepeat(email) {
  return await get('/users/checkEmailRepeat', {
    email
  })
}

export async function register(email, username, password) {
  return await post('/users/register', {
    email, 
    username, 
    password
  })
}