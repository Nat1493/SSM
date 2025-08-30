// ==============================================
// src/hooks/useNotification.js - Notification Hook
// ==============================================

import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper methods for different types
  const success = useCallback((message, duration = 3000) => 
    addNotification(message, 'success', duration), [addNotification]);
  
  const error = useCallback((message, duration = 5000) => 
    addNotification(message, 'error', duration), [addNotification]);
  
  const warning = useCallback((message, duration = 4000) => 
    addNotification(message, 'warning', duration), [addNotification]);
  
  const info = useCallback((message, duration = 3000) => 
    addNotification(message, 'info', duration), [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
};
