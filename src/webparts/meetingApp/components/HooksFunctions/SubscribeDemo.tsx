import * as React from 'react';
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() =>{
    handleStatusChange(null);
    
  });

  return isOnline;
}

export  default useFriendStatus;