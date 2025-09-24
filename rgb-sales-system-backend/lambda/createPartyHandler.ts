import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PartyDao, IParty, generatePartyPK } from './dao/partyDao';
import {TimeZoneUtil} from './utils/timezoneUtil';

// Handler for creating sales
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { addOn30Minutes, comment, amount, customerName, emailAddress, endTime, eventTime, eventDate, phoneNumber, packageOption } = body;
    // Generate Los Angeles date and timestamp
    const now = TimeZoneUtil.getCurrentTimeInTimeZone('America/Los_Angeles');

    const date = TimeZoneUtil.formatDate(now);
    const timestamp = TimeZoneUtil.getUnixTimestampFromDate(now).toString();

    
    const item: IParty = {
        PK: generatePartyPK(date), // Partition key
        SK: timestamp, // Sort key as a string
        addOn30Minutes: addOn30Minutes,
        amount: amount,
        comment: comment,
        customerName: customerName,
        emailAddress: emailAddress,
        eventDate: eventDate,
        eventTime: eventTime,
        endTime: endTime,
        phoneNumber: phoneNumber,
        packageOption: packageOption
    }

    const partyDao = new PartyDao();
    // const createdData = await salesTabledao.updateSales({ PK: item.PK, SK: item.SK}, item);
    await partyDao.createParty(item);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*", // Restrict to frontend origin
        "Access-Control-Allow-Headers": "*", // Allowed headers
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allowed methods
      },
      body: JSON.stringify({
        message: 'Party reservation created successfully',
        salesData: item
      }),
    };
  } catch (error) {
    console.error('Error creating party:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error,
      }),
    };
  }
};
