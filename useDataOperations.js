// ==============================================
// src/hooks/useDataOperations.js - Data Operations Hook
// ==============================================

import { useData } from '../contexts/DataContext';
import { useNotification } from './useNotification';

export const useDataOperations = () => {
  const { actions } = useData();
  const { success, error } = useNotification();

  const safeOperation = async (operation, successMessage, errorMessage) => {
    try {
      const result = await operation();
      if (successMessage) success(successMessage);
      return { success: true, data: result };
    } catch (err) {
      console.error('Operation failed:', err);
      if (errorMessage) error(errorMessage);
      return { success: false, error: err };
    }
  };

  return {
    // Order operations
    addOrder: (orderData) => safeOperation(
      () => actions.addOrder(orderData),
      'Order added successfully',
      'Failed to add order'
    ),
    
    updateOrder: (id, updates) => safeOperation(
      () => actions.updateOrder(id, updates),
      'Order updated successfully',
      'Failed to update order'
    ),
    
    deleteOrder: (id) => safeOperation(
      () => actions.deleteOrder(id),
      'Order deleted successfully',
      'Failed to delete order'
    ),

    // Customer operations
    addCustomer: (customerData) => safeOperation(
      () => actions.addCustomer(customerData),
      'Customer added successfully',
      'Failed to add customer'
    ),

    // Inventory operations
    addInventoryItem: (itemData) => safeOperation(
      () => actions.addInventoryItem(itemData),
      'Inventory item added successfully',
      'Failed to add inventory item'
    ),

    // Production operations
    addProductionStage: (stageData) => safeOperation(
      () => actions.addProductionStage(stageData),
      'Production stage added successfully',
      'Failed to add production stage'
    ),

    // Data management
    exportData: () => safeOperation(
      () => actions.exportData(),
      'Data exported successfully',
      'Failed to export data'
    ),
    
    importData: (data) => safeOperation(
      () => actions.importData(data),
      'Data imported successfully',
      'Failed to import data'
    )
  };
};
