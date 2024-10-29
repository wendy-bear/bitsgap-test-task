export enum OrderSideType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum ValidationFieldType {
  TAKE_PROFIT = 'takeProfit',
}

export enum ErrorsEnum {
  MaxSumProfit = 'Maximum profit sum is 500%',
  MinProfitValue = 'Minimum value is 0.01%',
  PreviousValue = "Each target's profit should be greater than the previous one",
  MinTradePrice = 'Price must be greater than 0',
}

export interface Profit {
  amountToSellBuy: number;
  profit: number;
  projectedProfit: number;
  targetPrice: number;
}
