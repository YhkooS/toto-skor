import { Worker } from 'bullmq';
import { skorQueue } from './totoQueue';
import { fetchClientById, fetchClientBet, skorGetTransactions, getBonus, addBonus } from '../services/betcoService'
import { DateTime } from 'luxon';


const worker = new Worker('skorQueue', async (job) => {
   
    const { match, winners, prize } = job.data
    const { startDate } = match

    for(const winner of winners){
        const { username } = winner
        console.log(`kazananlar: ${username} `)
        try{
            const clientData = await fetchClientById(username)
            const clientId = clientData[0].Id
            const userBalance = clientData[0].Balance
            const betCount = await fetchClientBet(clientId)
            const transDeposit = await skorGetTransactions(clientId, startDate)

            const endDateTime = DateTime.fromISO(startDate)
            const startDateTime = endDateTime.startOf('day');

            const getBonusData = await getBonus(clientId)

            console.log(getBonusData)

            // Sadece 00:00 ile endDateTime arasındaki yatırımları al
            const filteredDeposits = transDeposit.filter((deposit) => {
            const createdLocal = DateTime.fromISO(deposit.CreatedLocal); 
            return createdLocal >= startDateTime && createdLocal <= endDateTime;
          });

          // AcceptanceType: 0 veya ResultType: 0 olan bonus var mı 
        const hasRelevantBonus = getBonusData.some(
            (bonus) => bonus.AcceptanceType === 0 || bonus.ResultType === 0
          );

        

          if(filteredDeposits.length === 0){
            console.log(`${username} 00:00 ile başlangıç saati arasında yatırım bulunmamaktadır.`)
          } else {
            const hasLargeDeposit = filteredDeposits.some(deposit => deposit.Amount >= 100);
            
            if(hasLargeDeposit){
                console.log(`${username} 100TL yatırım mevcuttur`)
                if(betCount === 0) {
                    console.log(`${username} açık bahis bulunmamaktadır`)
                    if(userBalance < 10){
                        console.log(`${username} bakiye 10tl'den az`)
                        if(hasRelevantBonus === false){
                            console.log(`${username} aktif edilebilir veya sonuçlanmamış bonus bulunmamaktadır.`)
                            // ödül ekle
                            const { amount } = prize
                            const bonusId = 139978
                            const bonusAdd = await addBonus(clientId, bonusId, amount)


                        } else {
                            console.log(`${username} aktif edilebilir veya aktif bonus mevcuttur`)
                        }
                        
                    } else {
                        console.log(`${username} bakiye 10TL'den yüksek`)
                    }
                } else {
                    console.log(`${username} açık bahis mevcut`)
                }

            } else {
                console.log(`${username} yatırım 100TL'nin altında `)
            }
          }
            
        }catch (error) {
            console.log(error)
        }
    }


},{ connection: { host: 'localhost', port: 6379 } })