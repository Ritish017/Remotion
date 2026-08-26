import type { DatabaseProvider } from './DatabaseProvider';
import { SQLiteDatabaseProvider } from './SQLiteDatabaseProvider';

let instance: DatabaseProvider | null = null;

export class DatabaseFactory {
  static getProvider(): DatabaseProvider {
    if (!instance) {
      instance = new SQLiteDatabaseProvider();
    }
    return instance;
  }
}

export * from './DatabaseProvider';
export * from './SQLiteDatabaseProvider';
