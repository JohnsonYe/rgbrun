import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PartyDao, IParty, IUpdateParty} from './dao/partyDao';

// Handler for creating sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { PK, SK, comment, paidDeposit, paidCompleted } = body;
    
    const item: IUpdateParty = {
        comment: comment,
        paidDeposit: paidDeposit,
        paidCompleted: paidCompleted,
    }

    const partydao = new PartyDao();
    const updateItem = await partydao.updateParty({ PK: PK, SK: SK }, item);

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
