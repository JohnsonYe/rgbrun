import {
  DynamoDBClient,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, PutCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';

export class DynamoDbAccessor<T> {
  private tableName: string;
  private client: DynamoDBDocumentClient;

  constructor(tableName: string, region = 'us-west-1') {
    this.tableName = tableName;

    const dynamoClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  /**
   * Get an item from the table.
   * @param key - The primary key of the item.
   * @returns The item or null if not found.
   */
  async getItem(key: Record<string, any>): Promise<T | null> {
    const params = {
      TableName: this.tableName,
      Key: key,
    };

    try {
      const result = await this.client.send(new GetCommand(params));
      return result.Item as T | null;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }
  
  async queryItemsByPartitionKey(partitionKey: string): Promise<any[]> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'PK', // Partition key attribute name
      },
      ExpressionAttributeValues: {
        ':pk': partitionKey, // Partition key value
      },
    };
  
    try {
      const result = await this.client.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('Error querying items by partition key:', error);
      throw new Error('Failed to query items by partition key');
    }
  };

  /**
   * Insert or overwrite an item in the table.
   * @param item - The item to be inserted or overwritten.
   * @returns The result of the operation.
   */
  async putItem(item: Record<string, any>): Promise<void> {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: item,
    };

    try {
      await this.client.send(new PutCommand(params));
    } catch (error) {
      console.error('Error inserting item:', error);
      throw error;
    }
  }

  /**
   * Update an item in the table.
   * @param key - The primary key of the item to update.
   * @param updates - The attributes to update.
   * @returns The updated item.
   */
  async updateItem(key: Record<string, any>, updates: Partial<T>): Promise<T> {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [field, value] of Object.entries(updates)) {
      const fieldName = `#${field}`;
      const fieldValue = `:${field}`;
      updateExpression.push(`${fieldName} = ${fieldValue}`);
      expressionAttributeNames[fieldName] = field;
      expressionAttributeValues[fieldValue] = value;
    }

    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await this.client.send(new UpdateCommand(params));
      return result.Attributes as T;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  /**
   * Delete an item from the table.
   * @param key - The primary key of the item to delete.
   * @returns The result of the operation.
   */
  async deleteItem(key: Record<string, any>): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: key,
    };
    
    try {
      await this.client.send(new DeleteCommand(params));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
}
