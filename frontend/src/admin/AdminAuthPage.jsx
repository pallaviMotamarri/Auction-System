import React, { useState } from 'react';
import AdminRegister from './AdminRegister';
import AdminLogin from './AdminLogin';

const AdminAuthPage = ({ onLoggedIn }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="admin-auth-container">
  <div className="admin-auth-card">
    {showLogin ? (
      <>
        <AdminLogin onLoggedIn={onLoggedIn} />
      </>
    ) : (
      <>
        <AdminRegister onRegistered={() => setShowLogin(true)} />
        <p>
          Already registered? <button onClick={() => setShowLogin(true)}>Login</button>
        </p>
      </>
    )}
  </div>
</div>

  );
};

export default AdminAuthPage;
