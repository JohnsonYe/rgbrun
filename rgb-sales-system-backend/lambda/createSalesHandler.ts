import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SalesTableDao, ISales, generateSalesPK } from './dao/salesTableDao';
import { SalesType, PaymentType } from './enum/salesEnum';
import {TimeZoneUtil} from './utils/timezoneUtil';

// Handler for creating sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Handler Step: We are here, event body is: ", event.body);
    const body = JSON.parse(event.body || '{}');
    const { quantity, totalAmount, discount, paymentType, comment, salesType, gameType } = body;
    // Generate Los Angeles date and timestamp
    const now = TimeZoneUtil.getCurrentTimeInTimeZone('America/Los_Angeles');

    const date = TimeZoneUtil.formatDate(now);
    const timestamp = TimeZoneUtil.getUnixTimestampFromDate(now).toString();
    
    const givenSalesType = salesType == SalesType.GAME? SalesType.GAME: SalesType.DRINK;
    const givenPaymentType = paymentType == PaymentType.CARD? PaymentType.CARD: PaymentType.CASH;
    
    const item: ISales = {
        PK: generateSalesPK(date), // Partition key
        SK: timestamp, // Sort key as a string
        quantity: quantity,
        totalAmount: totalAmount,
        paymentType: givenPaymentType,
        discount: discount,
        comment: comment,
        type: givenSalesType,
        gameType: gameType
    }

    const salesTabledao = new SalesTableDao();
    // const createdData = await salesTabledao.updateSales({ PK: item.PK, SK: item.SK}, item);
    await salesTabledao.createSales(item);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict to frontend origin
        "Access-Control-Allow-Headers": "*", // Allowed headers
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allowed methods
      },
      body: JSON.stringify({
        message: 'Sale created successfully',
        salesData: item
      }),
    };
  } catch (error) {
    console.error('Error creating sale:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error,
      }),
    };
  }
};
