import axios from 'axios';
import dotenv from 'dotenv';
import { DateTime } from "luxon";
import { cli } from 'winston/lib/winston/config';

dotenv.config();

const betcoApi = axios.create({
    baseURL: 'https://backofficewebadmin.betconstruct.com/api/tr', 
    headers: {
        'Authentication': process.env.BETCONSTRUCT_API_KEY,
        'Content-Type': 'application/json'
    }
});


export const fetchClientById = async (user: string) => {
    try {
        const response = await betcoApi.post('/Client/GetClients', { Login: user });

        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'API isteği başarısız');
        }

        const clientData = response.data.Data.Objects; 
        
        
        return clientData;
    } catch (error) {
        console.error(`${user} ID’li kullanıcı alınırken hata oluştu:`);
        throw error; 
    }
};



export const fetchClientBet = async (clientId: number) => {
    try{
        const nowTime = DateTime.now().toUTC().plus({ hours: 3 });
        const dateFrmt = "dd-MM-yy - HH:mm:ss"

        const response = await betcoApi.post('/Report/GetBetHistory', {
            ClientId: clientId,
            CurrencyId: "TRY",
            ToCurrencyId: "TRY",
            StartDateLocal: nowTime.minus({ days: 7 }).toFormat(dateFrmt),
            EndDateLocal: nowTime.toFormat(dateFrmt),
            MaxRows: 10,
            SkeepRows: 0,
            State: 1,
        });
        
        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'Bet history isteği başarısız');
        }
        
        const betData = response.data.Data.BetData
        const betCount = betData.Count
        
        console.log(betCount)
        return betCount;
    } catch (error){
        console.log(error)
        throw error
    }
}

export const fetchClientGetTransactions = async (clientId: number, start: Date, end: Date) => {
    try {
        const dateFrmt = "dd-MM-yy - HH:mm:ss"
        const startDateTime = DateTime.fromJSDate(start);
        const endDateTime = DateTime.fromJSDate(end);
        const response = await betcoApi.post('/Client/GetClientTransactionsV1', {
            ClientId: clientId,
            ByPassTotals: true,
            CurrencyId: "TRY",
            DocumentTypeIds: [3],
            EndTimeLocal: endDateTime.toFormat(dateFrmt),
            StartTimeLocal: startDateTime.toFormat(dateFrmt),
            MaxRows: 0,
            SkeepRows: 0

        })

        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'Transaction isteği başarısız');
        }

        const transactionDeposit = response.data.Data.Objects;

        return transactionDeposit; 
    } catch (error){
        console.log(error)
        throw error
    }
}

