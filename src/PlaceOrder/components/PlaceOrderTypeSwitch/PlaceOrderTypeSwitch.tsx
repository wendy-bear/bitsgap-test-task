import { Button } from 'shared/components/Button/Button';
import { OrderSideType } from '../../model';

import styles from './PlaceOrderTypeSwitch.module.scss';

interface Props {
  activeOrderSide: OrderSideType;
  onChange(orderSide: OrderSideType): void;
}

const PlaceOrderTypeSwitch = ({ activeOrderSide, onChange }: Props) => {
  const handleToggle = (orderType: OrderSideType) => {
    onChange(orderType);
  };

  return (
    <div className={styles.root}>
      <Button
        color='green'
        fullWidth
        size='small'
        inactive={activeOrderSide !== 'buy'}
        onClick={() => handleToggle(OrderSideType.BUY)}
      >
        Buy
      </Button>
      <Button
        color='red'
        size='small'
        fullWidth
        inactive={activeOrderSide === 'buy'}
        onClick={() => handleToggle(OrderSideType.SELL)}
      >
        Sell
      </Button>
    </div>
  );
};

export { PlaceOrderTypeSwitch };
