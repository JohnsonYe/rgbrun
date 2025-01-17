import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SalesTableDao, ISales, generateSalesPK} from './dao/salesTableDao';

// Handler for getting sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Process Get Handler.");
  try {
    // Extract query parameters
    const fromDate = event.queryStringParameters?.fromDate;
    const toDate = event.queryStringParameters?.toDate;
    
    if (!fromDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required parameter: fromDate' }),
      };
    }

    let salesData: ISales[] = [];
    const salesTabledao = new SalesTableDao();
    if (!toDate || toDate === fromDate) {
      salesData = await salesTabledao.getSingleDaySales(fromDate);
    } else {
      salesData = await salesTabledao.getMultipleDaySales(fromDate, toDate);
    }

    const response = {
      data: salesData
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict to frontend origin
        "Access-Control-Allow-Headers": "*", // Allowed headers
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allowed methods
      },
      body: JSON.stringify(response)
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