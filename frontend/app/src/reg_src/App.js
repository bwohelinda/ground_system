import React, { useState } from 'react';
import Register from './Register';
import Success from './Success';

function App() {
  const [registered, setRegistered] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSuccess = (data) => {
    setUserData(data);
    setRegistered(true);
  };

  return (
    <div className="App">
      {registered ? (
        <Success userData={userData} />
      ) : (
        <Register onSuccess={handleSuccess} />
      )}
    </div>
  );
}

export default App;
