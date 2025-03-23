import { DynamoDbAccessor } from './dynamoDbAccessor';
import {TimeZoneUtil} from '../utils/timezoneUtil';

export interface IParty {
    PK: string; // Partition Key (e.g., PARTY#YYYY-MM-DD)
    SK: string; // Sort Key (e.g., Unix timestamp as a string)
    addOn30Minutes: number,
    amount: number,
    comment?: string,
    customerName: string,
    emailAddress: string,
    eventDate: string,
    eventTime: string,
    endTime: string,
    phoneNumber: string,
    packageOption?: string,
    paidDeposit?: boolean,
    paidCompleted?: boolean
}

export interface IUpdateParty {
    comment: string;
    paidDeposit?: boolean;
    paidCompleted?: boolean
}

const TABLE_NAME_SLAES = "SalesTable";

export class PartyDao extends DynamoDbAccessor<IParty> {
    constructor() {
        super(TABLE_NAME_SLAES);
    }

    async createParty(item: IParty): Promise<void> {
        return this.putItem(item);
    }


    async getSingleDayParty(date: string): Promise<any[]> {
        return this.queryItemsByPartitionKey(generatePartyPK(date));
    }
    
    async getMultipleDayParty(fromDate: string, toDate: string): Promise<any[]> {
        const dateRange = TimeZoneUtil.generateDateRange(fromDate, toDate);

        const queryPromise = dateRange.map(async (date) => this.getSingleDayParty(date));

        const result = await Promise.all(queryPromise);
        return result.flat();
    }

    async updateParty(key: { PK: string; SK: string }, updates: Partial<IParty>): Promise<IParty> {
        return this.updateItem(key, updates);
    }
}

export function generatePartyPK(key: string) {
    return `PARTY#${key}`;
}