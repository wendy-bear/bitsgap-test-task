import { StoreProvider } from './context/context';
import { PlaceOrderForm } from './components/PlaceOrderForm/PlaceOrderForm';

export const PlaceOrder = () => (
  <StoreProvider>
    <PlaceOrderForm />
  </StoreProvider>
);
