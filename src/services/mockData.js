// src/services/mockData.js
export const generateMockData = () => {
  const products = [
    { id: 1, name: 'MacBook Pro M2', category: 'Elektronik', price: 25000000 },
    { id: 2, name: 'Dell XPS 15', category: 'Elektronik', price: 22000000 },
    { id: 3, name: 'Samsung Galaxy S23', category: 'Elektronik', price: 15000000 },
    { id: 4, name: 'Sony WH-1000XM5', category: 'Elektronik', price: 5000000 },
    { id: 5, name: 'Nike Air Force 1', category: 'Fashion', price: 1500000 },
    { id: 6, name: 'Uniqlo Supima T-Shirt', category: 'Fashion', price: 199000 },
    { id: 7, name: 'Levi\'s 501 Jeans', category: 'Fashion', price: 899000 },
    { id: 8, name: 'Kopi Arabica 1kg', category: 'F&B', price: 250000 },
    { id: 9, name: 'Matcha Powder', category: 'F&B', price: 150000 },
    { id: 10, name: 'Oat Milk 1L', category: 'F&B', price: 45000 }
  ];

  const customers = [
    { id: 1, name: 'PT Maju Jaya', region: 'Jakarta' },
    { id: 2, name: 'Toko Sentosa', region: 'Surabaya' },
    { id: 3, name: 'Kopi Senja', region: 'Bandung' },
    { id: 4, name: 'Budi Santoso', region: 'Yogyakarta' },
    { id: 5, name: 'Siti Aminah', region: 'Medan' }
  ];

  const sales = [];
  const currentDate = new Date();
  let salesIdCount = 1;

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    let txCount = Math.floor(Math.random() * 20) + 20; 
    
    if (targetMonth.getMonth() >= 9) txCount = Math.floor(txCount * 1.8);

    for (let i = 0; i < txCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      
      sales.push({
        salesId: salesIdCount++,
        productId: product.id,
        productName: product.name,
        category: product.category,
        customerName: customer.name,
        region: customer.region,
        quantity: quantity,
        totalAmount: quantity * product.price,
        salesDate: new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day).toISOString()
      });
    }
  }
  return { products, customers, sales: sales.sort((a, b) => new Date(b.salesDate) - new Date(a.salesDate)) };
};