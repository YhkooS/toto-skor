import axios from 'axios';
import dotenv from 'dotenv';
import { DateTime } from "luxon";
import { cli } from 'winston/lib/winston/config';

export interface deposit {
    Amount: number;
    CreatedLocal: string;
}

export interface Bonus {
    Id: number;
    AcceptanceType: number;
    AcceptanceDateLocal: string | null;
    ClientBonusExpirationDateLocal: string | null;
    ResultType: number;
    ResultDateLocal: string | null;
    Name: string;
    Amount: number;
    ClientId: number;
  }

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

        const transactionDeposit: deposit[] = response.data.Data.Objects;
        return transactionDeposit; 
    } catch (error){
        console.log(error)
        throw error
    }
}

export const skorGetTransactions = async (clientId: number, startDate: string) => {
    try {
        const dateFrmt = "dd-MM-yy - HH:mm:ss"
        const endDateTime = DateTime.fromISO(startDate)
        const startDateTime = endDateTime.startOf('day');
        console.log(endDateTime.toFormat(dateFrmt), startDateTime.toFormat(dateFrmt))
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
        
        
        const transactionDeposit: deposit[] = response.data.Data.Objects;
        return transactionDeposit; 
    } catch (error){
        console.log(error)
        throw error
    }
}


export const getBonus = async (clientId: number): Promise<Bonus[]> => {
    try {
        const response = await betcoApi.post('/Client/GetClientBonuses', {
            ClientId: clientId
        })

        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'Transaction isteği başarısız');
        }

        const getBonusData: Bonus[] = response.data.Data;

        return getBonusData
    } catch (error){
        console.log(error)
        throw error
    }
}


export const addBonus = async (clientId: number, bonusId: number, amount: number) => {
    try {
        const response = await betcoApi.post('/Client/AddClientToBonus', {
            ClientId: clientId,
            PartnerBonusId: bonusId,
            Amount: amount
        })


        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'Transaction isteği başarısız');
        }


    } catch (error){
        console.log(error)
        throw error
    }
}

export const addCash = async (clientId: number, amount:number) => {
    try {
        const response = await betcoApi.post('/Client/CreateClientPaymentDocument', {
            ClientId: clientId,
            CurrencyId: "TRY",
            DocTypeInt: 3,
            Info: "toto",
            Amount: amount
        })

        if (response.data.HasError) {
            throw new Error(response.data.AlertMessage || 'Transaction isteği başarısız');
        }
    } catch (error){
        console.log(error)
        throw error
    }
}