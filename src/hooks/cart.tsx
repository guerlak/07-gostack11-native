/* eslint-disable no-plusplus */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);
const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storage = await AsyncStorage.getItem('@GoBarber:products');
      if (storage) {
        setProducts(JSON.parse(storage));
      }
    }
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(p => p.id === id);
      const prod = products[index];
      prod.quantity++;
      setProducts([...products]);
      await AsyncStorage.setItem(
        '@GoBarber:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(p => p.id === id);
      const prod = products[index];
      if (prod.quantity > 1) {
        prod.quantity--;
        setProducts([...products]);
        await AsyncStorage.setItem(
          '@GoBarber:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART
    const checkExist = products.filter(p => p.id === product.id);
    if (!checkExist.length) {
      product.quantity = 1;
      setProducts([...products, product]);
      await AsyncStorage.setItem(
        '@GoBarber:products',
        JSON.stringify(products),
      );
    } else {
      increment(product.id);
    }
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return context;
}
export { CartProvider, useCart };
