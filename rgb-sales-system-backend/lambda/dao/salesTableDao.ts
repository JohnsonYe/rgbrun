import { DynamoDbAccessor } from './dynamoDbAccessor';
import { SalesType, PaymentType } from '../enum/salesEnum';
import {TimeZoneUtil} from '../utils/timezoneUtil';


export interface ISales {
  PK: string; // Partition Key (e.g., SALES#YYYY-MM-DD)
  SK: string; // Sort Key (e.g., Unix timestamp as a string)
  quantity: number;
  totalAmount: number;
  paymentType: PaymentType; 
  discount?: number;
  comment?: string;
  score?: string;
  gameTime?: string;
  type: SalesType;
  gameType: string;
}

const TABLE_NAME_SLAES = "SalesTable";

export class SalesTableDao extends DynamoDbAccessor<ISales> {
    constructor() {
        super(TABLE_NAME_SLAES);
    }

    /**
     * Update sales data in the table.
     * @param key - The key of the sales item to update.
     * @param updates - The attributes to update.
     * @returns The updated sales item.
     */
    async updateSales(key: { PK: string; SK: string }, updates: Partial<ISales>): Promise<ISales> {
        return this.updateItem(key, updates);
    }

    /**
     * Fetch sales data from the table.
     * @param key - The key of the sales item to fetch.
     * @returns The fetched sales item.
     */
    async getSingleDaySales(date: string): Promise<any[]> {
        return this.queryItemsByPartitionKey(generateSalesPK(date));
    }

    async getMultipleDaySales(fromDate: string, toDate: string): Promise<any[]> {
        const dateRange = TimeZoneUtil.generateDateRange(fromDate, toDate);

        const queryPromise = dateRange.map(async (date) => this.getSingleDaySales(date));

        const result = await Promise.all(queryPromise);
        return result.flat();
    }

    async createSales(item: ISales): Promise<void> {
        return this.putItem(item);
    }
}

export function generateSalesPK(key: string) {
    return `SALES#${key}`;
}