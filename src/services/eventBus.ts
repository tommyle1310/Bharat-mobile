type Listener = () => void;

class SimpleEvent {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch {}
    });
  }
}

// Watchlist related events
class WatchlistEvents {
  private changed = new SimpleEvent();

  subscribe(listener: Listener): () => void {
    return this.changed.subscribe(listener);
  }

  emitChanged(): void {
    this.changed.emit();
  }
}

// Bid related events
class BidEvents {
  private bidPlaced = new SimpleEvent();
  private autoBidSaved = new SimpleEvent();

  subscribe(listener: Listener): () => void {
    return this.bidPlaced.subscribe(listener);
  }

  subscribeAutoBid(listener: Listener): () => void {
    return this.autoBidSaved.subscribe(listener);
  }

  emitBidPlaced(): void {
    this.bidPlaced.emit();
  }

  emitAutoBidSaved(): void {
    this.autoBidSaved.emit();
  }
}

export const watchlistEvents = new WatchlistEvents();
export const bidEvents = new BidEvents();


