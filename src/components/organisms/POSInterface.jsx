import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import * as PurchaseOrderService from "@/services/api/purchaseOrderService";
import * as TransactionService from "@/services/api/transactionService";
import * as GiftCardService from "@/services/api/giftCardService";
import * as FulfillmentService from "@/services/api/fulfillmentService";
import * as InventoryService from "@/services/api/inventoryService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";

const POSInterface = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerPaid, setCustomerPaid] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardAmount, setGiftCardAmount] = useState("");
  const [giftCardBalance, setGiftCardBalance] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showGiftCardPurchase, setShowGiftCardPurchase] = useState(false);
  const [showGiftCardRedeem, setShowGiftCardRedeem] = useState(false);
  
  // Returns & Exchanges
  const [transactionMode, setTransactionMode] = useState("sale"); // sale, return, exchange
  const [returnReceipt, setReturnReceipt] = useState("");
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await InventoryService.getAll();
      setProducts(data.filter(p => p.totalStock > 0));
    } catch (err) {
      setError("Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, size = "M") => {
    const cartItem = {
      id: `${product.Id}-${size}`,
      productId: product.Id,
      name: product.name,
      brand: product.brand,
      size,
      price: product.basePrice,
      quantity: 1
    };

    const existingItem = cart.find(item => item.id === cartItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === cartItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, cartItem]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateCartItemQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

const clearCart = () => {
    setCart([]);
    setReturnItems([]);
    setExchangeItems([]);
  };

  const resetTransactionState = () => {
    clearCart();
    setReturnReceipt("");
    setOriginalTransaction(null);
    setReturnItems([]);
    setExchangeItems([]);
    setReturnReason("");
    setCustomerPaid("");
    setGiftCardCode("");
    setGiftCardBalance(null);
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return calculateSubtotal() * (discount / 100);
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const calculateChange = () => {
    const paid = parseFloat(customerPaid) || 0;
    return paid - calculateTotal();
  };

const lookupTransaction = async () => {
    if (!returnReceipt.trim()) {
      toast.error("Please enter receipt number");
      return;
    }

    try {
      const transaction = await TransactionService.getById(parseInt(returnReceipt));
      if (transaction.type === "return" || transaction.type === "exchange") {
        toast.error("Cannot return/exchange a return or exchange transaction");
        return;
      }
      
      setOriginalTransaction(transaction);
      setReturnItems(transaction.items.map(item => ({ ...item, returnQuantity: 0 })));
      toast.success("Transaction found! Select items to return/exchange");
    } catch (err) {
      toast.error("Transaction not found");
      setOriginalTransaction(null);
      setReturnItems([]);
    }
  };

  const updateReturnQuantity = (itemId, quantity) => {
    setReturnItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, returnQuantity: Math.max(0, Math.min(item.quantity, quantity)) }
          : item
      )
    );
  };

  const getSelectedReturnItems = () => {
    return returnItems.filter(item => item.returnQuantity > 0);
  };

  const calculateReturnTotal = () => {
    const selectedItems = getSelectedReturnItems();
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.returnQuantity), 0);
    const discount = subtotal * (originalTransaction?.discount || 0) / (originalTransaction?.subtotal || subtotal);
    const tax = (subtotal - discount) * 0.08;
    return subtotal - discount + tax;
  };

  const calculateExchangeTotal = () => {
    const returnTotal = calculateReturnTotal();
    const newItemsTotal = transactionMode === "exchange" ? calculateTotal() : 0;
    return newItemsTotal - returnTotal;
  };

  const checkGiftCardBalance = async () => {
    if (!giftCardCode.trim()) {
      toast.error("Please enter gift card code");
      return;
    }

    try {
      const giftCard = await GiftCardService.getByCode(giftCardCode);
      setGiftCardBalance(giftCard.balance);
      toast.success(`Gift card balance: $${giftCard.balance.toFixed(2)}`);
    } catch (err) {
      toast.error("Invalid gift card code");
      setGiftCardBalance(null);
    }
  };

  const processGiftCardPurchase = async () => {
    const amount = parseFloat(giftCardAmount);
    if (!amount || amount < 5 || amount > 500) {
      toast.error("Gift card amount must be between $5 and $500");
      return;
    }

    if (!recipientName.trim()) {
      toast.error("Please enter recipient name");
      return;
    }

    if (paymentMethod === "cash" && parseFloat(customerPaid) < amount) {
      toast.error("Insufficient payment");
      return;
    }

    try {
      // Create gift card
      const giftCard = await GiftCardService.create({
        amount: amount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim() || null,
        purchasedBy: "POS User"
      });

      // Create transaction record
      const transaction = {
        type: "gift_card",
        giftCardCode: giftCard.code,
        giftCardAmount: amount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim() || null,
        total: amount,
        payment: {
          method: paymentMethod,
          amount: paymentMethod === "cash" ? parseFloat(customerPaid) : amount,
          change: paymentMethod === "cash" ? parseFloat(customerPaid) - amount : 0
        },
        timestamp: new Date().toISOString()
      };

      await TransactionService.create(transaction);
      
      toast.success(`Gift card created! Code: ${giftCard.code}`);
      setShowGiftCardPurchase(false);
      setGiftCardAmount("");
      setRecipientName("");
      setRecipientEmail("");
      setCustomerPaid("");
    } catch (err) {
      toast.error("Failed to create gift card");
      console.error("Gift card creation error:", err);
    }
  };

const processTransaction = async () => {
    if (transactionMode === "sale") {
      return processPayment();
    } else if (transactionMode === "return") {
      return processReturn();
    } else if (transactionMode === "exchange") {
      return processExchange();
    }
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const total = calculateTotal();

    if (paymentMethod === "cash" && parseFloat(customerPaid) < total) {
      toast.error("Insufficient payment");
      return;
    }

    if (paymentMethod === "gift_card") {
      if (!giftCardCode.trim()) {
        toast.error("Please enter gift card code");
        return;
      }
      
      try {
        const giftCard = await GiftCardService.getByCode(giftCardCode);
        if (giftCard.balance < total) {
          toast.error(`Insufficient gift card balance. Available: $${giftCard.balance.toFixed(2)}`);
          return;
        }
      } catch (err) {
        toast.error("Invalid gift card code");
        return;
      }
    }

    try {
      let transaction = {
        type: "sale",
        items: cart,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: total,
        payment: {
          method: paymentMethod,
          amount: total,
          change: 0
        },
        timestamp: new Date().toISOString()
      };

      if (paymentMethod === "cash") {
        transaction.payment.amount = parseFloat(customerPaid);
        transaction.payment.change = calculateChange();
      } else if (paymentMethod === "gift_card") {
        transaction.giftCardCode = giftCardCode;
        await GiftCardService.redeem(giftCardCode, total);
      }

      await TransactionService.create(transaction);
      
      // Update stock levels for sale
      for (const item of cart) {
        const product = products.find(p => p.Id === item.productId);
        if (product) {
          await InventoryService.update(item.productId, {
            ...product,
            totalStock: product.totalStock - item.quantity
          });
        }
      }

      toast.success("Payment processed successfully!");
      resetTransactionState();
      loadProducts();
    } catch (err) {
      toast.error("Failed to process payment");
      console.error("Payment error:", err);
    }
  };

  const processReturn = async () => {
    const selectedItems = getSelectedReturnItems();
    if (selectedItems.length === 0) {
      toast.error("Please select items to return");
      return;
    }

    if (!returnReason.trim()) {
      toast.error("Please provide a return reason");
      return;
    }

    try {
      const returnTotal = calculateReturnTotal();
      
      const transaction = {
        type: "return",
        originalTransactionId: originalTransaction.Id,
        items: selectedItems.map(item => ({
          ...item,
          quantity: item.returnQuantity,
          price: -item.price // Negative for return
        })),
        subtotal: -calculateReturnTotal(),
        discount: 0,
        tax: -(calculateReturnTotal() * 0.08) / 1.08 * 0.08,
        total: -returnTotal,
        returnReason: returnReason,
        payment: {
          method: "refund",
          amount: -returnTotal,
          change: 0
        },
        timestamp: new Date().toISOString()
      };

      await TransactionService.create(transaction);

      // Restore inventory
      for (const item of selectedItems) {
        const product = products.find(p => p.Id === item.productId);
        if (product) {
          await InventoryService.update(item.productId, {
            ...product,
            totalStock: product.totalStock + item.returnQuantity
          });
        }
      }

      toast.success(`Return processed! Refund amount: $${returnTotal.toFixed(2)}`);
      resetTransactionState();
      setTransactionMode("sale");
      loadProducts();
    } catch (err) {
      toast.error("Failed to process return");
      console.error("Return error:", err);
    }
  };

  const processExchange = async () => {
    const selectedReturnItems = getSelectedReturnItems();
    if (selectedReturnItems.length === 0) {
      toast.error("Please select items to return");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add new items for exchange");
      return;
    }

    const exchangeTotal = calculateExchangeTotal();
    
    if (exchangeTotal > 0 && paymentMethod === "cash" && parseFloat(customerPaid) < exchangeTotal) {
      toast.error("Insufficient payment for exchange difference");
      return;
    }

    try {
      // Create return portion
      const returnTransaction = {
        type: "return",
        originalTransactionId: originalTransaction.Id,
        items: selectedReturnItems.map(item => ({
          ...item,
          quantity: item.returnQuantity,
          price: -item.price
        })),
        subtotal: -calculateReturnTotal(),
        discount: 0,
        tax: -(calculateReturnTotal() * 0.08) / 1.08 * 0.08,
        total: -calculateReturnTotal(),
        returnReason: "Exchange - Return Portion",
        payment: {
          method: "refund",
          amount: -calculateReturnTotal(),
          change: 0
        },
        timestamp: new Date().toISOString()
      };

      // Create new sale portion
      const saleTransaction = {
        type: "sale",
        items: cart,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: calculateTotal(),
        exchangeId: returnTransaction.Id,
        payment: {
          method: exchangeTotal <= 0 ? "exchange_credit" : paymentMethod,
          amount: Math.max(0, exchangeTotal),
          change: exchangeTotal < 0 ? Math.abs(exchangeTotal) : (paymentMethod === "cash" ? parseFloat(customerPaid) - exchangeTotal : 0)
        },
        timestamp: new Date().toISOString()
      };

      await TransactionService.create(returnTransaction);
      await TransactionService.create(saleTransaction);

      // Update inventory - restore returned items
      for (const item of selectedReturnItems) {
        const product = products.find(p => p.Id === item.productId);
        if (product) {
          await InventoryService.update(item.productId, {
            ...product,
            totalStock: product.totalStock + item.returnQuantity
          });
        }
      }

      // Update inventory - reduce new items
      for (const item of cart) {
        const product = products.find(p => p.Id === item.productId);
        if (product) {
          await InventoryService.update(item.productId, {
            ...product,
            totalStock: product.totalStock - item.quantity
          });
        }
      }

      if (exchangeTotal > 0) {
        toast.success(`Exchange completed! Additional payment: $${exchangeTotal.toFixed(2)}`);
      } else if (exchangeTotal < 0) {
        toast.success(`Exchange completed! Refund: $${Math.abs(exchangeTotal).toFixed(2)}`);
      } else {
        toast.success("Exchange completed! No additional payment required");
      }

      resetTransactionState();
      setTransactionMode("sale");
      loadProducts();
    } catch (err) {
      toast.error("Failed to process exchange");
      console.error("Exchange error:", err);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.styleCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading rows={6} />;
  if (error) return <Error message={error} onRetry={loadProducts} />;

return (
    <div className="space-y-6">
      {/* Transaction Mode Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Point of Sale</h1>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={transactionMode === "sale" ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setTransactionMode("sale");
                  resetTransactionState();
                }}
                className="rounded-md"
              >
                <ApperIcon name="ShoppingCart" className="h-4 w-4 mr-1" />
                Sale
              </Button>
              <Button
                variant={transactionMode === "return" ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setTransactionMode("return");
                  resetTransactionState();
                }}
                className="rounded-md"
              >
                <ApperIcon name="RotateCcw" className="h-4 w-4 mr-1" />
                Return
              </Button>
              <Button
                variant={transactionMode === "exchange" ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setTransactionMode("exchange");
                  resetTransactionState();
                }}
                className="rounded-md"
              >
                <ApperIcon name="RefreshCw" className="h-4 w-4 mr-1" />
                Exchange
              </Button>
            </div>
          </div>
          <Badge 
            variant={
              transactionMode === "sale" ? "success" : 
              transactionMode === "return" ? "warning" : "info"
            }
            size="lg"
          >
            {transactionMode.toUpperCase()} MODE
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Lookup for Returns/Exchanges */}
        {(transactionMode === "return" || transactionMode === "exchange") && (
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {transactionMode === "return" ? "Process Return" : "Process Exchange"}
              </h2>
              
              {!originalTransaction ? (
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      label="Receipt/Transaction Number"
                      value={returnReceipt}
                      onChange={(e) => setReturnReceipt(e.target.value)}
                      placeholder="Enter receipt number"
                      className="flex-1"
                    />
                    <Button
                      onClick={lookupTransaction}
                      disabled={!returnReceipt.trim()}
                      className="mt-6"
                    >
                      <ApperIcon name="Search" className="h-4 w-4 mr-1" />
                      Lookup
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Transaction #{originalTransaction.Id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(originalTransaction.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Original Total: ${originalTransaction.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOriginalTransaction(null);
                        setReturnItems([]);
                        setReturnReceipt("");
                      }}
                    >
                      <ApperIcon name="X" className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Return Reason */}
                  <Input
                    label="Return Reason"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Enter reason for return/exchange"
                  />

                  {/* Return Items Selection */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Select Items to Return</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {returnItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.brand} - Size {item.size}</p>
                            <p className="text-sm text-gray-700">${item.price.toFixed(2)} each (Qty: {item.quantity})</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReturnQuantity(item.id, item.returnQuantity - 1)}
                              disabled={item.returnQuantity <= 0}
                            >
                              <ApperIcon name="Minus" className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.returnQuantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReturnQuantity(item.id, item.returnQuantity + 1)}
                              disabled={item.returnQuantity >= item.quantity}
                            >
                              <ApperIcon name="Plus" className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {getSelectedReturnItems().length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Return Total:</span>
                          <span className="font-semibold text-lg">${calculateReturnTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Product Browser - Only show for sales and exchanges with original transaction */}
        {(transactionMode === "sale" || (transactionMode === "exchange" && originalTransaction)) && (
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {transactionMode === "exchange" ? "New Items" : "Products"}
                </h2>
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="Search"
                  className="w-64"
                />
              </div>

          {filteredProducts.length === 0 ? (
            <Empty 
              title="No products available" 
              description="No products match your search or are in stock"
              icon="Package"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Package" className="h-6 w-6 text-gray-600" />
                    </div>
                    <Badge variant={product.totalStock <= product.reorderPoint ? "warning" : "success"} size="sm">
                      {product.totalStock} left
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-900">
                      ${product.basePrice.toFixed(2)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.availableSizes.slice(0, 3).map(size => (
                        <Badge key={size} variant="default" size="sm">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
</div>
          )}
        </Card>
      </div>
        )}

        {/* Cart & Checkout */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Cart</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="ShoppingCart" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.brand} - Size {item.size}</p>
                      <p className="text-sm text-gray-700">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      >
                        <ApperIcon name="Minus" className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      >
                        <ApperIcon name="Plus" className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-error hover:text-error"
                      >
                        <ApperIcon name="X" className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount */}
              <div className="mb-4">
                <Input
                  label="Discount (%)"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  min="0"
                  max="100"
                  className="text-sm"
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({discount}%):</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

{/* Gift Card Actions */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Gift Card Services</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGiftCardPurchase(!showGiftCardPurchase)}
                    className="justify-center"
                  >
                    <ApperIcon name="Gift" className="h-4 w-4 mr-1" />
                    Sell Gift Card
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGiftCardRedeem(!showGiftCardRedeem)}
                    className="justify-center"
                  >
                    <ApperIcon name="CreditCard" className="h-4 w-4 mr-1" />
                    Check Balance
                  </Button>
                </div>

                {/* Gift Card Purchase */}
                {showGiftCardPurchase && (
                  <div className="space-y-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900">Create Gift Card</h4>
                    <Input
                      label="Amount ($5 - $500)"
                      type="number"
                      value={giftCardAmount}
                      onChange={(e) => setGiftCardAmount(e.target.value)}
                      placeholder="50.00"
                      min="5"
                      max="500"
                      step="0.01"
                      className="text-sm"
                    />
                    <Input
                      label="Recipient Name *"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient name"
                      className="text-sm"
                    />
                    <Input
                      label="Recipient Email (optional)"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={paymentMethod === "cash" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setPaymentMethod("cash")}
                      >
                        Cash
                      </Button>
                      <Button
                        variant={paymentMethod === "card" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setPaymentMethod("card")}
                      >
                        Card
                      </Button>
                    </div>
                    {paymentMethod === "cash" && (
                      <Input
                        label="Amount Received"
                        type="number"
                        value={customerPaid}
                        onChange={(e) => setCustomerPaid(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="text-sm"
                      />
                    )}
                    <Button
                      onClick={processGiftCardPurchase}
                      size="sm"
                      className="w-full"
                      disabled={!giftCardAmount || !recipientName || (paymentMethod === "cash" && parseFloat(customerPaid) < parseFloat(giftCardAmount))}
                    >
                      Create Gift Card
                    </Button>
                  </div>
                )}

                {/* Gift Card Balance Check */}
                {showGiftCardRedeem && (
                  <div className="space-y-3 p-3 bg-white rounded border">
                    <h4 className="font-medium text-gray-900">Gift Card Balance</h4>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter gift card code"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                        className="text-sm flex-1"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={checkGiftCardBalance}
                        disabled={!giftCardCode.trim()}
                      >
                        Check
                      </Button>
                    </div>
                    {giftCardBalance !== null && (
                      <div className="p-2 bg-success/10 rounded text-sm text-success">
                        Available Balance: ${giftCardBalance.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPaymentMethod("cash")}
                    className="justify-center"
                  >
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPaymentMethod("card")}
                    className="justify-center"
                  >
                    Card
                  </Button>
                  <Button
                    variant={paymentMethod === "gift_card" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setPaymentMethod("gift_card")}
                    className="justify-center"
                  >
                    Gift Card
                  </Button>
                </div>
              </div>

              {/* Cash Payment */}
              {paymentMethod === "cash" && (
                <div className="mb-4">
                  <Input
                    label="Amount Received"
                    type="number"
                    value={customerPaid}
                    onChange={(e) => setCustomerPaid(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="text-sm"
                  />
                  {customerPaid && parseFloat(customerPaid) >= calculateTotal() && (
                    <div className="mt-2 p-2 bg-success/10 rounded text-sm text-success">
                      Change: ${calculateChange().toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Gift Card Payment */}
              {paymentMethod === "gift_card" && (
                <div className="mb-4">
                  <div className="flex space-x-2 mb-2">
                    <Input
                      label="Gift Card Code"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                      placeholder="Enter gift card code"
                      className="text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkGiftCardBalance}
                      disabled={!giftCardCode.trim()}
                      className="mt-6"
                    >
                      <ApperIcon name="Search" className="h-4 w-4" />
                    </Button>
                  </div>
                  {giftCardBalance !== null && (
                    <div className={`mt-2 p-2 rounded text-sm ${
                      giftCardBalance >= calculateTotal() 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      Available: ${giftCardBalance.toFixed(2)} | 
                      Required: ${calculateTotal().toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Process Payment */}
{/* Transaction Processing */}
              {transactionMode === "return" ? (
                <Button
                  onClick={processTransaction}
                  className="w-full"
                  disabled={!originalTransaction || getSelectedReturnItems().length === 0 || !returnReason.trim()}
                >
                  <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
                  Process Return (${calculateReturnTotal().toFixed(2)})
                </Button>
              ) : transactionMode === "exchange" ? (
                <>
                  {originalTransaction && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Return Credit:</span>
                        <span className="text-success">+${calculateReturnTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>New Items:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>
                          {calculateExchangeTotal() >= 0 ? "Amount Due:" : "Refund Due:"}
                        </span>
                        <span className={calculateExchangeTotal() >= 0 ? "text-error" : "text-success"}>
                          ${Math.abs(calculateExchangeTotal()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={processTransaction}
                    className="w-full"
                    disabled={
                      !originalTransaction || 
                      getSelectedReturnItems().length === 0 || 
                      cart.length === 0 ||
                      (calculateExchangeTotal() > 0 && paymentMethod === "cash" && parseFloat(customerPaid) < calculateExchangeTotal())
                    }
                  >
                    <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
                    Process Exchange
                  </Button>
                </>
              ) : (
                <Button
                  onClick={processTransaction}
                  className="w-full"
                  disabled={
                    cart.length === 0 || 
                    (paymentMethod === "cash" && parseFloat(customerPaid) < calculateTotal()) ||
                    (paymentMethod === "gift_card" && (!giftCardCode.trim() || (giftCardBalance !== null && giftCardBalance < calculateTotal())))
                  }
                >
                  Process Payment
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default POSInterface;