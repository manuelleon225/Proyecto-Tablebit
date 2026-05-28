interface InternalContract {
  name: string;
  version: string;
  frozen: boolean;
  validated: boolean;
  schema: string;
}

const contracts: InternalContract[] = [];

export function registerInternalContract(name: string, version: string, schema: string): void {
  contracts.push({ name, version, frozen: false, validated: true, schema });
}

export function validateInternalContract(name: string): boolean {
  const c = contracts.find((c) => c.name === name);
  return c ? c.validated : false;
}

export function freezeInternalContracts(): void {
  contracts.forEach((c) => { c.frozen = true; });
}

export function getContractRegistry(): InternalContract[] {
  return [...contracts];
}

export function getContractMetrics() {
  return { total: contracts.length, frozen: contracts.filter((c) => c.frozen).length, validated: contracts.filter((c) => c.validated).length };
}
