import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { InventoryService } from "@/services/api/inventoryService";
import { TransactionService } from "@/services/api/transactionService";
import { GiftCardService } from "@/services/api/giftCardService";

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
        // Update gift card balance
        await GiftCardService.redeem(giftCardCode, total);
      }

      await TransactionService.create(transaction);
      
      // Update stock levels
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
      clearCart();
      setCustomerPaid("");
      setGiftCardCode("");
      setGiftCardBalance(null);
      setDiscount(0);
      loadProducts(); // Refresh stock levels
    } catch (err) {
      toast.error("Failed to process payment");
      console.error("Payment error:", err);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Browser */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
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
<Button
                onClick={processPayment}
                className="w-full"
                disabled={
                  cart.length === 0 || 
                  (paymentMethod === "cash" && parseFloat(customerPaid) < calculateTotal()) ||
                  (paymentMethod === "gift_card" && (!giftCardCode.trim() || (giftCardBalance !== null && giftCardBalance < calculateTotal())))
                }
              >
                Process Payment
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default POSInterface;