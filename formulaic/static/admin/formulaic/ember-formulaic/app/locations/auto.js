import HistoryLocation from '@ember/routing/history-location';

export default class CustomAutoLocation extends HistoryLocation {
  constructor() {
    super(...arguments);
    console.log('CustomAutoLocation initialized');
  }
}
