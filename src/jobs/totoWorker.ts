import { Worker } from 'bullmq';
import { totoQueue } from './totoQueue';
import { fetchClientById, fetchClientBet, fetchClientGetTransactions, addBonus, addCash } from '../services/betcoService'
import { add } from 'winston';


const worker = new Worker('totoQueue', async (job) => {
    const { toto, prizes, contenders } = job.data;
    const { startDate, endDate } = toto;
    const { rightGuess7, rightGuess8, rightGuess9, rightGuess10 } = prizes

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
                const hasLargeDeposit = transactionDeposit.some(deposit => deposit.Amount >= 250);
                
                if (hasLargeDeposit) {
                    console.log(`${username} 250 tl veya üzeri yatırım mevcut `);
                    if(betCount === 0){
                        console.log(`${username} açık bahis bulunmamaktadır`)
                        if (userBalance < 10){
                            console.log(`${username} için bakiye 10tl altıdır. Tüm şartlar uyuyor ödül alabilir.`)

                            // ödül ekle
                            if (correctGuessCount === 7) {
                                const { amount } = rightGuess7
                                const bonusId = 139979
                                const bonusAdd = await addBonus(clientId, bonusId, amount)
                            }

                            if (correctGuessCount === 8) {
                                const { amount } = rightGuess8
                                const cashAdd = await addCash(clientId,amount)
                            }

                            if (correctGuessCount === 9) {
                                const { amount } = rightGuess9
                                const cashAdd = await addCash(clientId,amount)
                            }

                            if (correctGuessCount === 10) {
                                const { amount } = rightGuess10
                                const cashAdd = await addCash(clientId,amount)
                            }

                        }
                    } else {
                        console.log(`${username} açık bahis mevcut`)
                    }
                    
                } else {
                    console.log(`${username} yatırımı 250tl'den az`);
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

