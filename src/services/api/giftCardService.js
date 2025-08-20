import giftCardData from '@/services/mockData/giftCards.json';

export class GiftCardService {
  static async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return giftCardData.map(card => ({ ...card }));
  }

  static async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const card = giftCardData.find(c => c.Id === parseInt(id));
    if (!card) throw new Error('Gift card not found');
    return { ...card };
  }

  static async getByCode(code) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const card = giftCardData.find(c => c.code === code.toUpperCase());
    if (!card) throw new Error('Gift card not found');
    if (card.status !== 'active') throw new Error('Gift card is not active');
    return { ...card };
  }

  static async create(cardData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newId = Math.max(...giftCardData.map(c => c.Id), 0) + 1;
    const code = this.generateCode();
    
    const newCard = {
      Id: newId,
      code: code,
      amount: parseFloat(cardData.amount),
      balance: parseFloat(cardData.amount),
      recipientName: cardData.recipientName,
      recipientEmail: cardData.recipientEmail || null,
      purchasedBy: cardData.purchasedBy || "Unknown",
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      transactions: []
    };

    giftCardData.push(newCard);
    return { ...newCard };
  }

  static async redeem(code, amount) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const card = giftCardData.find(c => c.code === code.toUpperCase());
    
    if (!card) throw new Error('Gift card not found');
    if (card.status !== 'active') throw new Error('Gift card is not active');
    if (card.balance < amount) throw new Error('Insufficient balance');

    const oldBalance = card.balance;
    card.balance -= amount;
    
    // Add transaction record
    card.transactions.push({
      type: 'redemption',
      amount: -amount,
      balance: card.balance,
      timestamp: new Date().toISOString()
    });

    // Update status if fully used
    if (card.balance <= 0) {
      card.status = 'used';
    }

    return {
      ...card,
      transaction: {
        oldBalance,
        newBalance: card.balance,
        amountUsed: amount
      }
    };
  }

  static async addBalance(code, amount) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const card = giftCardData.find(c => c.code === code.toUpperCase());
    
    if (!card) throw new Error('Gift card not found');
    
    const oldBalance = card.balance;
    card.balance += amount;
    card.status = 'active'; // Reactivate if needed

    // Add transaction record
    card.transactions.push({
      type: 'reload',
      amount: amount,
      balance: card.balance,
      timestamp: new Date().toISOString()
    });

    return {
      ...card,
      transaction: {
        oldBalance,
        newBalance: card.balance,
        amountAdded: amount
      }
    };
  }

  static async deactivate(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const card = giftCardData.find(c => c.Id === parseInt(id));
    
    if (!card) throw new Error('Gift card not found');
    
    card.status = 'deactivated';
    card.deactivatedAt = new Date().toISOString();
    
    return { ...card };
  }

  static async getTransactionHistory(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const card = giftCardData.find(c => c.Id === parseInt(id));
    
    if (!card) throw new Error('Gift card not found');
    
    return card.transactions || [];
  }

  static generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    // Generate 4 groups of 4 characters
    for (let i = 0; i < 4; i++) {
      if (i > 0) code += '-';
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    // Ensure uniqueness
    const exists = giftCardData.some(c => c.code === code);
    return exists ? this.generateCode() : code;
  }

  static async getActiveCards() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return giftCardData
      .filter(card => card.status === 'active' && card.balance > 0)
      .map(card => ({ ...card }));
  }

  static async getExpiredCards() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const now = new Date();
    return giftCardData
      .filter(card => new Date(card.expiresAt) < now)
      .map(card => ({ ...card }));
  }
}