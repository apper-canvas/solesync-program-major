import mockDocuments from '@/services/mockData/documents.json';

class DocumentServiceClass {
  constructor() {
    this.documents = [...mockDocuments];
    this.nextId = Math.max(...this.documents.map(doc => doc.Id), 0) + 1;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...this.documents];
  }

  async getById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid document ID');
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    const document = this.documents.find(doc => doc.Id === id);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    return { ...document };
  }

  async getBySupplier(supplierId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.documents
      .filter(doc => doc.supplierId === supplierId)
      .map(doc => ({ ...doc }));
  }

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.documents
      .filter(doc => doc.category === category)
      .map(doc => ({ ...doc }));
  }

  async create(documentData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newDocument = {
      ...documentData,
      Id: this.nextId++,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.documents.unshift(newDocument);
    return { ...newDocument };
  }

  async update(id, updateData) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid document ID');
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = this.documents.findIndex(doc => doc.Id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    const updatedDocument = {
      ...this.documents[index],
      ...updateData,
      Id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    this.documents[index] = updatedDocument;
    return { ...updatedDocument };
  }

  async delete(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid document ID');
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.documents.findIndex(doc => doc.Id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    const deletedDocument = this.documents.splice(index, 1)[0];
    return { ...deletedDocument };
  }

  async search(query) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const searchTerm = query.toLowerCase();
    return this.documents
      .filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.supplier.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm)
      )
      .map(doc => ({ ...doc }));
  }

  async getStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalDocuments = this.documents.length;
    const categories = {};
    const suppliers = {};
    let totalSize = 0;
    
    this.documents.forEach(doc => {
      categories[doc.category] = (categories[doc.category] || 0) + 1;
      suppliers[doc.supplier] = (suppliers[doc.supplier] || 0) + 1;
      totalSize += doc.size || 0;
    });
    
    const recentUploads = this.documents.filter(doc => {
      const uploadDate = new Date(doc.uploadedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate > weekAgo;
    }).length;
    
    return {
      totalDocuments,
      categories,
      suppliers,
      totalSize,
      recentUploads
    };
  }
}

export const DocumentService = new DocumentServiceClass();