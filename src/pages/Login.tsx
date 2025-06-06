import React from 'react';

export const loginUser = async (username: string, password: string) => {
  return { token: '' };
};

const Login: React.FC = () => {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <input placeholder="Username" />
        <input placeholder="Password" type="password" />
      </form>
    </div>
  );
};

export default Login;
