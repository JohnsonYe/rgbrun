import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SalesTableDao, IUpdateSales } from './dao/salesTableDao';

// Handler for creating sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { PK, SK, comment, score } = body;
    
    const item: IUpdateSales = {
        comment: comment,
        score: score,
    }

    const salesTabledao = new SalesTableDao();
    const updateItem = await salesTabledao.updateSales({ PK: PK, SK: SK }, item);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict to frontend origin
        "Access-Control-Allow-Headers": "*", // Allowed headers
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allowed methods
      },
      body: JSON.stringify({
        message: 'Sale updated successfully',
        updatedSalesData: updateItem
      }),
    };
  } catch (error) {
    console.error('Error updating sale:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error,
      }),
    };
  }
};
