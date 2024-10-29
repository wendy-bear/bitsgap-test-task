import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { QuestionTooltip } from 'shared/components/QuestionTooltip/QuestionTooltip';
import { Button } from 'shared/components/Button/Button';
import { NumberInput } from 'shared/components/NumberInput/NumberInput';
import styles from './PlaceOrderForm.module.scss';
import { useStore } from 'PlaceOrder/context/context';
import { PlaceOrderTypeSwitch } from '../PlaceOrderTypeSwitch/PlaceOrderTypeSwitch';
import { BASE_CURRENCY, QUOTE_CURRENCY } from 'PlaceOrder/constants';
import { TakeProfit } from '../TakeProfit/TakeProfit';
import { OrderSideType } from 'PlaceOrder/model';

export interface Error {
  id: string | number;
  message: string;
}

export const PlaceOrderForm = observer(() => {
  const {
    activeOrderSide,
    price,
    total,
    amount,
    setPrice,
    setAmount,
    setTotal,
    setOrderSide,
  } = useStore();

  const [takeProfitErrors, setTakeProfitErrors] = useState<Array<Error> | null>(
    null,
  );
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (takeProfitErrors && takeProfitErrors.length > 0) {
      console.log('Validation errors', takeProfitErrors);
    } else {
      console.log('Submitted!');
    }
  };

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <div className={styles.label}>
        Market direction{' '}
        <QuestionTooltip message='Market direction description' />
      </div>
      <div className={styles.wraper}>
        <div className={styles.typeSwitch}>
          <PlaceOrderTypeSwitch
            activeOrderSide={activeOrderSide}
            onChange={setOrderSide}
          />
        </div>
        <NumberInput
          label={`Price, ${QUOTE_CURRENCY}`}
          value={price}
          onChange={value => setPrice(Number(value))}
        />
        <NumberInput
          value={amount}
          label={`Amount, ${BASE_CURRENCY}`}
          onChange={value => setAmount(Number(value))}
        />
        <NumberInput
          value={total}
          label={`Total, ${QUOTE_CURRENCY}`}
          onChange={value => setTotal(Number(value))}
        />
        <TakeProfit
          activeOrderSide={activeOrderSide}
          price={price}
          amount={amount}
          errors={takeProfitErrors}
          setErrors={setTakeProfitErrors}
          isActive={isActive}
          setIsActive={setIsActive}
        />
        <div className={styles.submit}>
          <Button
            color={activeOrderSide === OrderSideType.BUY ? 'green' : 'red'}
            type='submit'
            fullWidth
            inactive={
              (isActive && takeProfitErrors && takeProfitErrors?.length > 0) ??
              false
            }
          >
            {activeOrderSide === OrderSideType.BUY
              ? `Buy ${BASE_CURRENCY}`
              : `Sell ${QUOTE_CURRENCY}`}
          </Button>
        </div>
      </div>
    </form>
  );
});
