import promotionData from '@/services/mockData/promotions.json';

export const PromotionService = {
  static async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return promotionData.map(promotion => ({ ...promotion }));
  },

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const promotion = promotionData.find(p => p.Id === parseInt(id));
    if (!promotion) throw new Error('Promotion not found');
    return { ...promotion };
  },

  static async create(promotion) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...promotionData.map(p => p.Id), 0) + 1;
    const newPromotion = { 
      ...promotion, 
      Id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    promotionData.push(newPromotion);
    return { ...newPromotion };
  },

  static async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = promotionData.findIndex(p => p.Id === parseInt(id));
    if (index === -1) throw new Error('Promotion not found');
    
    promotionData[index] = { 
      ...promotionData[index], 
      ...updateData, 
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    return { ...promotionData[index] };
  },

  static async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = promotionData.findIndex(p => p.Id === parseInt(id));
    if (index === -1) throw new Error('Promotion not found');
    
    const deleted = promotionData.splice(index, 1)[0];
    return { ...deleted };
  },

  static async getActivePromotions() {
    await new Promise(resolve => setTimeout(resolve, 250));
    const now = new Date();
    return promotionData.filter(p => 
      p.status === 'active' && 
      new Date(p.startDate) <= now && 
      new Date(p.endDate) >= now
    ).map(promotion => ({ ...promotion }));
  }
};