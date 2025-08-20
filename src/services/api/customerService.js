import customers from '@/services/mockData/customers.json';

let customerData = [...customers];
let nextId = Math.max(...customerData.map(c => c.Id)) + 1;

export const customerService = {
  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...customerData];
  },

  async getById(id) {
    if (typeof id !== 'number') {
      throw new Error('Customer ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    const customer = customerData.find(c => c.Id === id);
    
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    return { ...customer };
  },

  async create(customerData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
const newCustomer = {
      ...customerData,
      Id: nextId++,
      dateJoined: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      rewardsBalance: 0,
      tierProgress: 0,
      redemptionHistory: []
    };
    
    customerData.push(newCustomer);
    return { ...newCustomer };
  },

  async update(id, updateData) {
    if (typeof id !== 'number') {
      throw new Error('Customer ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = customerData.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
customerData[index] = {
      ...customerData[index],
      ...updateData,
      Id: id // Ensure ID doesn't change
    };
    
    return { ...customerData[index] };
  },

  async delete(id) {
    if (typeof id !== 'number') {
      throw new Error('Customer ID must be a number');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = customerData.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    customerData.splice(index, 1);
    return true;
  },

  async searchByEmail(email) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return customerData.filter(c => 
      c.email.toLowerCase().includes(email.toLowerCase())
    );
  },

  async getByMembershipTier(tier) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return customerData.filter(c => c.membershipTier === tier);
  },
async getActiveCustomers() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return customerData.filter(c => c.status === 'active');
  },

  async awardPoints(id, points, reason = 'Purchase') {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = customerData.findIndex(c => c.Id === id);
    if (index === -1) throw new Error('Customer not found');
    
    customerData[index].loyaltyPoints += points;
    customerData[index].rewardsBalance += Math.floor(points / 10); // 10 points = 1 reward
    customerData[index].tierProgress += points;
    
    // Check for tier upgrade
    const tierThresholds = { bronze: 0, silver: 1000, gold: 2500, platinum: 5000 };
    let newTier = customerData[index].membershipTier;
    
    if (customerData[index].tierProgress >= tierThresholds.platinum && newTier !== 'platinum') {
      newTier = 'platinum';
    } else if (customerData[index].tierProgress >= tierThresholds.gold && newTier !== 'gold' && newTier !== 'platinum') {
      newTier = 'gold';
    } else if (customerData[index].tierProgress >= tierThresholds.silver && newTier === 'bronze') {
      newTier = 'silver';
    }
    
    customerData[index].membershipTier = newTier;
    
    return { ...customerData[index] };
  },

  async redeemRewards(id, amount, item) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = customerData.findIndex(c => c.Id === id);
    if (index === -1) throw new Error('Customer not found');
    if (customerData[index].rewardsBalance < amount) throw new Error('Insufficient rewards balance');
    
    customerData[index].rewardsBalance -= amount;
    customerData[index].redemptionHistory.push({
      date: new Date().toISOString(),
      amount,
      item,
      id: Date.now()
    });
    
    return { ...customerData[index] };
  },

  async getLoyaltyStats() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const totalCustomers = customerData.length;
    const totalPoints = customerData.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const tierDistribution = customerData.reduce((acc, c) => {
      acc[c.membershipTier] = (acc[c.membershipTier] || 0) + 1;
      return acc;
    }, {});
    
    return { totalCustomers, totalPoints, tierDistribution };
  }
};

export default customerService;