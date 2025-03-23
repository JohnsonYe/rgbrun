import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PartyDao, IParty } from './dao/partyDao';

// Handler for getting sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    let partyData: IParty[] = [];
    const salesTabledao = new PartyDao();
    if (!toDate || toDate === fromDate) {
        partyData = await salesTabledao.getSingleDayParty(fromDate);
    } else {
        partyData = await salesTabledao.getMultipleDayParty(fromDate, toDate);
    }

    const response = {
      data: partyData
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