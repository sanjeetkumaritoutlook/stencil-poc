import { createStore } from '@stencil/store';
import {
  DisposeEventHandler,
  GetEventHandler,
  Getter,
  OnChangeHandler,
  OnHandler,
  ResetEventHandler,
  SetEventHandler,
  Setter,
} from '@stencil/store/dist/types';

export class FluidStore<T> {
  private readonly reset: () => void;
  private readonly get: Getter<T>;
  private readonly set: Setter<T>;
  private readonly onChange: OnChangeHandler<T>;
  private readonly on: OnHandler<T>;
  private readonly dispose: () => void;
  private readonly state: any;

  constructor(initialState: T) {
    const { reset, get, onChange, on, set, dispose, state } =
      createStore<T>(initialState);
    this.reset = reset;
    this.get = get;
    this.set = set;
    this.onChange = onChange;
    this.on = on;
    this.dispose = dispose;
    this.state = state;
  }

  /**
   * Store Listeners
   * @param callback
   */
  onSet(callback: SetEventHandler<T>) {
    this.on('set', callback);
  }
  onGet(callback: GetEventHandler<T>) {
    this.on('get', callback);
  }
  onReset(callback: ResetEventHandler) {
    this.on('reset', callback);
  }
  onDestroy(callback: DisposeEventHandler) {
    this.on('dispose', callback);
  }
  onValueChange(propName: keyof T, callback: any) {
    this.onChange(propName, callback);
  }

  /**
   * Getters and Setters
   * @param propName
   */
  getValue(propName: keyof T & string) {
    return this.get(propName);
  }
  setValue(propName: keyof T & string, value: any) {
    this.set(propName, value);
  }
  getState() {
    return this.state;
  }

  /**
   * Reset and Destroy
   */
  resetStore() {
    this.reset();
  }
  destroy() {
    this.dispose();
  }
}
