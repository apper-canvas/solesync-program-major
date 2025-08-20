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
      totalSpent: 0
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
  }
};

export default customerService;