interface Transaction {
  id: string;
  operations: string[];
  timestamp: number;
  committed: boolean;
}

const TX_PREFIX = "tbit_tx_";
let activeTx: Transaction | null = null;

export function beginTransaction(name: string): string {
  const id = `${name}_${Date.now()}`;
  activeTx = { id, operations: [], timestamp: Date.now(), committed: false };
  localStorage.setItem(TX_PREFIX + id, JSON.stringify(activeTx));
  return id;
}

export function commitTransaction(): void {
  if (!activeTx) return;
  activeTx.committed = true;
  localStorage.removeItem(TX_PREFIX + activeTx.id);
  activeTx = null;
}

export function rollbackTransaction(): void {
  if (!activeTx) return;
  localStorage.removeItem(TX_PREFIX + activeTx.id);
  activeTx = null;
}

export function cleanupOrphanTransactions(): number {
  let cleaned = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TX_PREFIX)) {
      try {
        const tx: Transaction = JSON.parse(localStorage.getItem(key)!);
        if (Date.now() - tx.timestamp > 60000) {
          localStorage.removeItem(key);
          cleaned++;
        }
      } catch {
        localStorage.removeItem(key);
        cleaned++;
      }
    }
  }
  return cleaned;
}
