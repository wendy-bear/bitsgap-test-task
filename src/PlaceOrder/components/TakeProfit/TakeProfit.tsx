import { useState, useEffect, ChangeEvent } from 'react';
import { Switch } from 'shared/components/Switch/Switch';
import { TextButton } from 'shared/components/TextButton/TextButton';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { QuestionTooltip } from 'shared/components/QuestionTooltip/QuestionTooltip';
import { ErrorsEnum, OrderSideType, Profit } from '../../model';
import styles from './TakeProfit.module.scss';
//import CancelIcon from '@mui/icons-material/Cancel';
import { MAX_ROWS } from 'PlaceOrder/constants';
import CloseIcon from '../../../shared/assets/CloseIcon.svg';

type SetErrorsFunction = (errors: Array<Error> | null) => void;
interface TakeProfitProps {
  activeOrderSide: OrderSideType;
  price: number;
  amount: number;
  errors: Array<Error> | null;
  setErrors: SetErrorsFunction;
  isActive: boolean;
  setIsActive: (isActive: boolean | ((prevState: boolean) => boolean)) => void;
}
interface Error {
  id: string | number;
  message: string;
}

const TakeProfit = ({
  activeOrderSide,
  price,
  amount,
  errors,
  setErrors,
  isActive,
  setIsActive,
}: TakeProfitProps) => {
  const [profitRowList, setProfitRowList] = useState<Array<Profit>>([]);
  const [projectedProfitSumAmount, setProjectedProfitSumAmount] =
    useState<number>(0);

  useEffect(() => {
    if (profitRowList.length > 0) {
      const newProfitList = getProfitList(profitRowList);
      setProfitRowList(newProfitList);
      const projectedProfitSum =
        calculateProjectedProfitSumAmount(newProfitList);
      setProjectedProfitSumAmount(projectedProfitSum);
      handleValidationErrors(newProfitList);
    }
  }, [activeOrderSide, price, amount]);

  useEffect(() => {
    if (profitRowList) {
      const projectedProfitSum =
        calculateProjectedProfitSumAmount(profitRowList);
      setProjectedProfitSumAmount(projectedProfitSum);
      handleValidationErrors(profitRowList);
    }
  }, [profitRowList.length]);

  useEffect(() => {
    if (!price || !amount) {
      setProfitRowList([]);
      setIsActive(false);
    }
  }, [price, amount]);

  const handleToggle = () => {
    if (price && amount) {
      setIsActive(prevState => !prevState);
      addProfitTargetRow();
    }
    if (isActive) {
      setProfitRowList([]);
      setErrors(null);
    }
  };

  const calculateTargetPrice = (profit = 2) => {
    return activeOrderSide === OrderSideType.BUY
      ? price * (1 + profit / 100)
      : price * (1 - profit / 100);
  };

  const calculateProjectedProfit = (
    targetPrice: number,
    amountToBuySell: number,
  ) => {
    return activeOrderSide === OrderSideType.BUY
      ? amountToBuySell * (targetPrice - price)
      : amountToBuySell * (price - targetPrice);
  };

  const calculateProjectedProfitSumAmount = (profitList: Profit[]): number =>
    profitList.reduce((acc, row) => acc + row.projectedProfit, 0);

  const amountProfit = profitRowList
    ? Number(amount) / Number(profitRowList?.length + 1)
    : 0;

  const getProfitList = (list: Profit[]): Profit[] => {
    const calculateProfitAmountInPrecents = 100 / list.length;
    const newProfitList = list.map(item => {
      const amountProfit = Number(amount) / Number(list.length);
      const targetPrice = calculateTargetPrice(item.profit);
      const recalculateProjectedProfit = calculateProjectedProfit(
        targetPrice,
        amountProfit,
      );
      return {
        amountToSellBuy: calculateProfitAmountInPrecents,
        targetPrice,
        profit: item.profit,
        projectedProfit: recalculateProjectedProfit,
      };
    });
    return newProfitList;
  };

  const getEditedProfitList = (list: Profit[]): Profit[] => {
    const newProfitList = list.map(item => {
      const amountProfit = Number(amount) * (item.amountToSellBuy / 100);
      const targetPrice = calculateTargetPrice(item.profit);
      const recalculateProjectedProfit = calculateProjectedProfit(
        targetPrice,
        amountProfit,
      );
      return {
        amountToSellBuy: Number(item.amountToSellBuy),
        targetPrice,
        profit: item.profit,
        projectedProfit: recalculateProjectedProfit,
      };
    });
    return newProfitList;
  };

  const createProfit = (
    profit: number,
    targetPrice: number,
    amountToSellBuy: number,
  ) => {
    return {
      profit,
      targetPrice,
      amountToSellBuy,
      projectedProfit: calculateProjectedProfit(targetPrice, amountProfit),
    };
  };

  const addProfitTargetRow = () => {
    const calculateProfitAmountInPrecents = 100 / (profitRowList.length + 1);
    const newProfitList = profitRowList?.map(item => {
      const reCalculateprojectedProfit = calculateProjectedProfit(
        item.targetPrice,
        amountProfit,
      );
      return {
        amountToSellBuy: calculateProfitAmountInPrecents,
        targetPrice: item.targetPrice,
        profit: item.profit,
        projectedProfit: reCalculateprojectedProfit,
      };
    });
    const profitTarget =
      newProfitList[newProfitList.length - 1]?.profit + 2 || 2;
    const targetPrice = calculateTargetPrice(profitTarget);
    const profitData = createProfit(
      profitTarget,
      targetPrice,
      calculateProfitAmountInPrecents,
    );
    setProfitRowList([...newProfitList, profitData]);
  };

  const handleChangeProfitData = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
    type: string,
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const updatedProfitList = profitRowList.map((item: Profit, itemIndex) => {
      if (itemIndex === index) {
        const updatedValue = { [type]: Number(value) };
        return { ...item, ...updatedValue };
      }
      return item;
    });
    const newProfitList = getEditedProfitList(updatedProfitList);
    const projectedProfitSum = calculateProjectedProfitSumAmount(newProfitList);
    setProjectedProfitSumAmount(projectedProfitSum);
    setProfitRowList(newProfitList);
    handleValidationErrors(newProfitList);
  };

  const handleRemoveItem = (id: number) => {
    const filtededProfitList = profitRowList.filter(item => item.profit !== id);
    const newProfitList = getProfitList(filtededProfitList);
    const projectedProfitSum = calculateProjectedProfitSumAmount(newProfitList);
    setProjectedProfitSumAmount(projectedProfitSum);
    setProfitRowList(newProfitList);
    const errorList = validate(newProfitList);
    if (errorList) setErrors(errorList);
  };

  const handleValidationErrors = (list: Profit[]) => {
    const errors = validate(list);
    setErrors(errors?.length ? errors : null);
  };

  const validate = (profitList: Profit[]) => {
    const errorSet: Set<Error> = new Set();
    let totalProfit = 0;
    let totalAmount = 0;

    profitList.forEach((item, index) => {
      totalProfit += item.profit;
      totalAmount += item.amountToSellBuy;

      if (item.profit < 0.01)
        errorSet.add({ id: index, message: ErrorsEnum.MinProfitValue });
      if (index > 0 && item.profit < profitList[index - 1].profit)
        errorSet.add({ id: index, message: ErrorsEnum.PreviousValue });
      if (item.targetPrice < 0)
        errorSet.add({ id: index, message: ErrorsEnum.MinTradePrice });
    });

    if (totalProfit > 500)
      errorSet.add({ id: 'totalProfit', message: ErrorsEnum.MaxSumProfit });
    if (totalAmount !== 100) {
      const message =
        totalAmount > 100
          ? `${totalAmount} out of 100% selected. Please decrease by ${
              totalAmount - 100
            }%.`
          : `${totalAmount} out of 100% selected. Please increase by ${
              100 - totalAmount
            }%.`;
      errorSet.add({ id: 'totalAmount', message });
    }

    return Array.from(errorSet);
  };

  const isErrorRow = (index: number) =>
    errors?.some((item: Error) => item.id === index) ? styles.profitError : '';

  const ErrorBlock = () => {
    return (
      <div className={styles.error}>
        {Array.from(new Set(errors?.map(error => error.message))).map(
          (message, index) => (
            <div key={index}>{message}</div>
          ),
        )}
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.label}>
          <QuestionTooltip message='Take Profit' />{' '}
          <span className={styles.title}>Take Profit</span>
        </div>
        <Switch checked={isActive} onChange={handleToggle} />
      </div>
      {isActive && (
        <>
          <table>
            <thead>
              <tr>
                <td>Profit</td>
                <td>Target price</td>
                <td className={styles.amountToBuySell}>
                  {activeOrderSide === OrderSideType.BUY
                    ? 'Amount to buy'
                    : 'Amount to sell'}
                </td>
              </tr>
            </thead>
            <tbody>
              {profitRowList &&
                profitRowList?.map((row, index) => (
                  <tr className={`${isErrorRow(index)}`} key={index}>
                    <td>
                      <div className={styles.inputWrapper}>
                        <input
                          className={styles.input}
                          type='number'
                          value={row.profit}
                          onChange={event =>
                            handleChangeProfitData(event, index, 'profit')
                          }
                        />
                        <span className={styles.percentProfit}>%</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.targetPrice}>
                        {row.targetPrice.toFixed(1)}
                      </span>
                      &nbsp;<span className={styles.usdt}>USDT</span>
                    </td>
                    <td>
                      <input
                        className={styles.input}
                        type='number'
                        value={row.amountToSellBuy}
                        onChange={event =>
                          handleChangeProfitData(
                            event,
                            index,
                            'amountToSellBuy',
                          )
                        }
                      />
                      <span className={styles.percentAmount}>%</span>
                      <div className={styles.closeIconWrapper}>
                        <IconButton
                          aria-label='delete'
                          onClick={() => handleRemoveItem(row.profit)}
                        >
                          <img src={CloseIcon} className={styles.closeIcon} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {errors && errors.length > 0 && <ErrorBlock />}

          {profitRowList && profitRowList?.length < MAX_ROWS ? (
            <div className={styles.buttonContainer}>
              <TextButton
                startIcon={<AddCircleIcon />}
                onClick={addProfitTargetRow}
                className={styles.button}
              >{`Add profit target ${profitRowList.length}/${MAX_ROWS}`}</TextButton>
            </div>
          ) : null}
          <div className={styles.profitBlock}>
            <div className={styles.title}>Projected profit</div>
            <div className={styles.border}></div>
            <div className={styles.sum}>
              <span className={styles.amount}>
                {projectedProfitSumAmount.toFixed(2)}
              </span>{' '}
              USDT
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export { TakeProfit };
