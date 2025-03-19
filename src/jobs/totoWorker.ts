import { Worker } from 'bullmq';
import { totoQueue } from './totoQueue';
import { fetchClientById, fetchClientBet, fetchClientGetTransactions } from '../services/betcoService'
import { error } from 'console';
import { cli } from 'winston/lib/winston/config';

const worker = new Worker('totoQueue', async (job) => {
    const { toto, prizes, contenders } = job.data;
    const { startDate, endDate } = toto;
   
    for(const contender of contenders){
        const { username, correctGuessCount } = contender;
        console.log (`Kullanıcı adı: ${username}, Doğru tahmin sayısı: ${correctGuessCount}`)

        if (correctGuessCount >= 7){
            console.log(correctGuessCount)
            console.log('7 ve üstü doğru tahmin ödül alabilir ')
            

            try{
                const clientData = await fetchClientById(username);
                const clientId = clientData[0].Id
                const userBalance = clientData[0].Balance
                const betCount = await fetchClientBet(clientId)
                
                const start = new Date(startDate)
                const end = new Date(endDate)
                const transactionDeposit = await fetchClientGetTransactions(clientId,start,end)
                
                
            if (transactionDeposit.length === 0) {
                console.log(`${username} için yatırım bulunmamaktadır ödül alamaz`);
            } else {
                const depositAmount = transactionDeposit[0].Amount;
                console.log(`${username} için yatırım miktarı: ${depositAmount} tl`);
                if (depositAmount >= 250) {
                    if(betCount === 0){
                        if (userBalance < 10){
                            console.log(`${username} için tüm şartlar uyuyor ödül alabilir.`)
                        }
                        console.log(`${username} açık bahis bulunmamaktadır`)
                    } else {
                        console.log(`${username} açık bahis mevcut`)
                    }
                    console.log(`${username} 250 tl veya üzeri yatırım mevcut `);
                } else {
                    console.log(`${username} yatırımı 250'tlden az`);
                }
            }
                
            } catch (error) {
                console.log(error)
            }
            
        }else {
            console.log('7 ve üzeri doğru tahmin ödül alabilir')
        }

        
    }

}, { connection: { host: 'localhost', port: 6379 } });

