import { observable, computed, action, makeAutoObservable } from 'mobx';

import { OrderSideType } from '../model';

export class PlaceOrderStore {
  constructor() {
    makeAutoObservable(this);
  }

  @observable activeOrderSide: OrderSideType = OrderSideType.BUY;
  @observable price = 0;
  @observable amount = 0;

  @computed get total(): number {
    return this.price * this.amount;
  }

  @action
  public setOrderSide = (side: OrderSideType) => {
    this.activeOrderSide = side;
  };

  @action
  public setPrice = (price: number) => {
    this.price = price;
  };

  @action
  public setAmount = (amount: number) => {
    this.amount = amount;
  };

  @action
  public setTotal = (total: number) => {
    this.amount = this.price > 0 ? total / this.price : 0;
  };
}
