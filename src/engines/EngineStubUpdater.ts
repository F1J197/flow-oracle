// Quick utility to add missing methods to engines
import { IntelligenceViewData, DetailedModalData, DashboardTileData } from '@/types/engines';
import { createDefaultIntelligenceView, createDefaultDetailedModal } from './EngineHelpers';

// Add these methods to engines that need them:

export const addMissingMethods = (engineClass: any) => {
  if (!engineClass.prototype.category) {
    engineClass.prototype.category = 'core';
  }
  
  if (!engineClass.prototype.getIntelligenceView) {
    engineClass.prototype.getIntelligenceView = function(): IntelligenceViewData {
      const dashboardData = this.getDashboardData();
      return createDefaultIntelligenceView(this.name, dashboardData);
    };
  }
  
  if (!engineClass.prototype.getDetailedModal) {
    engineClass.prototype.getDetailedModal = function(): DetailedModalData {
      const dashboardData = this.getDashboardData();
      return createDefaultDetailedModal(this.name, 'Engine description', dashboardData);
    };
  }
};